import {
  BaseSystemProps,
  Camera,
  clamp,
  Color,
  CTransform,
  Entity,
  EventManager,
  EventType,
  Graphics,
  inject,
  Rectangle,
  Size,
  System,
  Vec2,
  View,
} from '@jume-labs/jume-engine';

import { CPhysicsBody } from '../components/cPhysicsBody.js';
import { PhysicsEvent } from '../events/physicsEvent.js';
import { Collide } from '../physics/interactionTypes.js';
import { QuadTree } from '../physics/quadTree.js';
import { RayHitList } from '../physics/rayHit.js';

export interface SPhysicsProps extends BaseSystemProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  iterations?: number;
  gravity?: { x: number; y: number };
}

interface DebugRay {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  hit: boolean;
}

const OVERLAP_PADDING = 4;

const BOUNDS_COLOR = new Color(0.5, 0.5, 0.5);
const BODY_COLOR = new Color(0, 0.5, 0.9);
const STATIC_BODY_COLOR = new Color(0, 0.85, 0);
const RAY_COLOR = new Color(1, 0.5, 0);
const RAY_HIT_COLOR = new Color(1, 1, 0);

export class SPhysics extends System {
  drawRays = true;

  debugLineWidth = 1;

  showQuadTree = false;

  iterations = 8;

  gravity = new Vec2();

  private readonly entities: Entity[] = [];

  private treeList: CPhysicsBody[] = [];

  private interactionEvents: PhysicsEvent[] = [];

  private bounds = new Rectangle();

  private tree!: QuadTree;

  private debugRays: DebugRay[] = [];

  @inject
  private readonly eventManager!: EventManager;

  @inject
  private readonly view!: View;

  constructor(props: SPhysicsProps) {
    super(props);

    const { x, y, width, height, gravity, iterations } = props;

    if (gravity) {
      this.gravity.set(gravity.x, gravity.y);
    }

    if (iterations) {
      this.iterations = iterations;
    }

    this.bounds.set(x ?? 0, y ?? 0, width ?? this.view.viewWidth, height ?? this.view.viewHeight);
    this.tree = new QuadTree(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

    this.registerList({ entities: this.entities, components: [CPhysicsBody, CTransform] });
    this.active = true;

    return this;
  }

  override update(dt: number): void {
    if (!this.active) {
      return;
    }

    if (this.debugRays.length > 1000) {
      this.debugRays = [];
    }

    this.tree.clear();

    for (const entity of this.entities) {
      if (!entity.active) {
        continue;
      }

      const body = entity.getComponent(CPhysicsBody);
      this.updatePastInteractions(body);
      body.wasTouching.value = body.touching.value;
      this.updateBodyBounds(entity);

      if (!this.bounds.intersects(body.bounds)) {
        continue;
      }

      if (body.bodyType !== 'static') {
        if (body.bodyType === 'dynamic') {
          if (body.useGravity) {
            body.velocity.x += body.acceleration.x + this.gravity.x;
            body.velocity.y += body.acceleration.y + this.gravity.y;
          }

          if (body.velocity.x > 0) {
            body.velocity.x -= body.drag.x;
          } else if (body.velocity.x < 0) {
            body.velocity.x += body.drag.x;
          }

          if (body.velocity.y > 0) {
            body.velocity.y -= body.drag.y;
          } else if (body.velocity.y < 0) {
            body.velocity.y += body.drag.y;
          }

          if (body.maxVelocity.x !== 0) {
            body.velocity.x = clamp(body.velocity.x, -body.maxVelocity.x, body.maxVelocity.x);
          }

          if (body.maxVelocity.y !== 0) {
            body.velocity.y = clamp(body.velocity.y, -body.maxVelocity.y, body.maxVelocity.y);
          }
        }
        body.bounds.x += body.velocity.x * dt;
        body.bounds.y += body.velocity.y * dt;
      }
      this.tree.insert(body);
    }

    for (let i = 0; i < this.iterations; i++) {
      for (const entity of this.entities) {
        const body = entity.getComponent(CPhysicsBody);
        if (body.active) {
          while (this.treeList.length > 0) {
            this.treeList.pop();
          }
          this.tree.getBodyList(body, this.treeList);

          for (const body2 of this.treeList) {
            this.checkCollision(body, body2);
          }
        }
      }
    }

    for (const entity of this.entities) {
      this.updateTransform(entity);
    }

    for (const entity of this.entities) {
      const body = entity.getComponent(CPhysicsBody);
      if (body.active) {
        for (const body2 of body.wasCollidingWith) {
          if (!body.collidingWith.includes(body2)) {
            this.interactionEvents.push(PhysicsEvent.get('collision end', body, body2));
          }
        }

        for (const body2 of body.wasTriggeredBy) {
          if (!body.triggeredBy.includes(body2)) {
            this.interactionEvents.push(PhysicsEvent.get('trigger end', body, body2));
          }
        }
      }
    }

    while (this.interactionEvents.length > 0) {
      this.eventManager.send(this.interactionEvents.pop()!);
    }
  }

  override debugRender(graphics: Graphics, cameras: Camera[]): void {
    for (const camera of cameras) {
      if (!camera.active) {
        continue;
      }

      camera.updateTransform();

      graphics.pushTarget(camera.target);
      // Don't clear the camera so we draw on top of the already rendered scene.
      graphics.start(false);

      graphics.pushTransform();
      graphics.applyTransform(camera.transform);

      if (this.showQuadTree) {
        graphics.color.copyFrom(BOUNDS_COLOR);

        const bounds = this.tree.getTreeBounds();
        for (const rect of bounds) {
          graphics.drawRect(rect.x, rect.y, rect.width, rect.height, this.debugLineWidth);
        }
      }

      for (const entity of this.entities) {
        const body = entity.getComponent(CPhysicsBody);
        if (!body.active) {
          continue;
        }

        const bounds = body.bounds;
        if (body.bodyType === 'static') {
          graphics.color.copyFrom(STATIC_BODY_COLOR);
        } else {
          graphics.color.copyFrom(BODY_COLOR);
        }
        graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height, this.debugLineWidth);
      }
    }

    if (this.drawRays) {
      for (const ray of this.debugRays) {
        if (ray.hit) {
          graphics.color.copyFrom(RAY_HIT_COLOR);
        } else {
          graphics.color.copyFrom(RAY_COLOR);
        }
        graphics.drawLine(ray.startX, ray.startY, ray.endX, ray.endY, 'center', this.debugLineWidth);
      }
    }

    graphics.popTransform();
    graphics.present();
    graphics.popTarget();
  }

  raycast(startX: number, startY: number, endX: number, endY: number, tags?: string[], out?: RayHitList): RayHitList {
    this.tree.getLineList(startX, startY, endX, endY, out);

    if (out!.count > 0 && tags) {
      out!.filterOnTags(tags);
    }

    if (this.drawRays) {
      const ray: DebugRay = {
        startX,
        startY,
        endX,
        endY,
        hit: out!.count > 0,
      };
      this.debugRays.push(ray);
    }

    return out!;
  }

  getPosition(out?: Vec2): Vec2 {
    if (!out) {
      out = Vec2.get();
    }
    out.set(this.bounds.x, this.bounds.y);

    return out;
  }

  setPosition(x: number, y: number): void {
    this.bounds.x = x;
    this.bounds.y = y;
    this.tree.updatePosition(x, y);
  }

  getSize(out?: Size): Size {
    if (!out) {
      out = new Size();
    }
    out.set(this.bounds.width, this.bounds.height);

    return out;
  }

  setSize(width: number, height: number): void {
    this.bounds.width = width;
    this.bounds.height = height;
    this.tree.updateBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }

  private updatePastInteractions(body: CPhysicsBody): void {
    while (body.wasCollidingWith.length > 0) {
      body.wasCollidingWith.pop();
    }

    while (body.wasTriggeredBy.length > 0) {
      body.wasTriggeredBy.pop();
    }

    while (body.collidingWith.length > 0) {
      body.wasCollidingWith.push(body.collidingWith.pop()!);
    }

    while (body.triggeredBy.length > 0) {
      body.wasTriggeredBy.push(body.triggeredBy.pop()!);
    }
  }

  private checkCollision(body1: CPhysicsBody, body2: CPhysicsBody): void {
    if (body1.mask.has(body2.group.value) && body2.mask.has(body1.group.value) && this.intersects(body1, body2)) {
      if (body1.bodyType === 'dynamic' && !body1.isTrigger && !body2.isTrigger) {
        this.separate(body1, body2);
        if (!body1.wasCollidingWith.includes(body2)) {
          if (!this.hasInteraction(PhysicsEvent.COLLISION_START, body1, body2)) {
            this.interactionEvents.push(PhysicsEvent.get('collision start', body1, body2));
          }
        } else {
          if (!this.hasInteraction(PhysicsEvent.COLLISION_STAY, body1, body2)) {
            this.interactionEvents.push(PhysicsEvent.get('collision stay', body1, body2));
          }
        }

        if (!body1.collidingWith.includes(body2)) {
          body1.collidingWith.push(body2);
        }
      } else if (body1.isTrigger && !body2.isTrigger) {
        if (!body1.wasTriggeredBy.includes(body2)) {
          if (!this.hasInteraction(PhysicsEvent.TRIGGER_START, body1, body2)) {
            this.interactionEvents.push(PhysicsEvent.get('trigger start', body1, body2));
          }
        } else {
          if (!this.hasInteraction(PhysicsEvent.TRIGGER_STAY, body1, body2)) {
            this.interactionEvents.push(PhysicsEvent.get('trigger stay', body1, body2));
          }
        }

        if (!body1.triggeredBy.includes(body2)) {
          body1.triggeredBy.push(body2);
        }
      } else if (body2.isTrigger && !body1.isTrigger) {
        if (!body2.wasTriggeredBy.includes(body1)) {
          if (!this.hasInteraction(PhysicsEvent.TRIGGER_START, body2, body1)) {
            this.interactionEvents.push(PhysicsEvent.get('trigger start', body2, body1));
          }
        } else {
          if (!this.hasInteraction(PhysicsEvent.TRIGGER_STAY, body2, body1)) {
            this.interactionEvents.push(PhysicsEvent.get('trigger stay', body2, body1));
          }
        }

        if (!body2.triggeredBy.includes(body1)) {
          body2.triggeredBy.push(body1);
        }
      }
    }
  }

  private hasInteraction(type: EventType<PhysicsEvent>, body1: CPhysicsBody, body2: CPhysicsBody): boolean {
    for (const event of this.interactionEvents) {
      if (event.name === type.name && event.body1 === body1 && event.body2 === body2) {
        return true;
      }
    }

    return false;
  }

  private separate(body1: CPhysicsBody, body2: CPhysicsBody): boolean {
    if (Math.abs(body1.velocity.x) > Math.abs(body1.velocity.y)) {
      return this.separateX(body1, body2) || this.separateY(body1, body2);
    } else {
      return this.separateY(body1, body2) || this.separateX(body1, body2);
    }
  }

  private separateX(body1: CPhysicsBody, body2: CPhysicsBody): boolean {
    const bounds1 = body1.bounds;
    const bounds2 = body2.bounds;

    let overlap = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width) - Math.max(bounds1.x, bounds2.x);
    const ov = bounds1.x > bounds2.x ? overlap : -overlap;

    if (
      (ov < 0 && bounds1.x + bounds1.width * 0.5 > bounds2.x + bounds2.width * 0.5) ||
      (ov > 0 && bounds1.x + bounds1.width * 0.5 < bounds2.x + bounds2.width * 0.5)
    ) {
      return false;
    }

    const delta = bounds1.x - body1.lastPos.x;

    if (overlap > Math.abs(delta) + OVERLAP_PADDING && delta !== 0) {
      overlap = 0;
    }
    overlap = bounds1.x > bounds2.x ? overlap : -overlap;

    if (overlap === 0) {
      return false;
    }

    if (overlap > 0) {
      if (body1.velocity.x > 0 || !body1.canCollide.has(Collide.LEFT) || !body2.canCollide.has(Collide.RIGHT)) {
        return false;
      }

      body1.touching.add(Collide.LEFT);
      body2.touching.add(Collide.RIGHT);
    } else {
      if (body1.velocity.x < 0 || !body1.canCollide.has(Collide.RIGHT) || !body2.canCollide.has(Collide.LEFT)) {
        return false;
      }

      body1.touching.add(Collide.RIGHT);
      body2.touching.add(Collide.LEFT);
    }

    if (body2.bodyType !== 'dynamic') {
      bounds1.x += overlap;
      body1.velocity.x = -body1.velocity.x * body1.bounce;
    } else {
      overlap *= 0.5;
      bounds1.x += overlap;
      bounds2.x -= overlap;

      let velocity1 = body2.velocity.x;
      let velocity2 = body1.velocity.x;
      const average = (velocity1 + velocity2) * 0.5;

      velocity1 -= average;
      velocity2 -= average;
      body1.velocity.x = average + velocity1 * body1.bounce;
      body2.velocity.x = average + velocity2 * body2.bounce;
    }

    return true;
  }

  private separateY(body1: CPhysicsBody, body2: CPhysicsBody): boolean {
    const bounds1 = body1.bounds;
    const bounds2 = body2.bounds;

    let overlap = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height) - Math.max(bounds1.y, bounds2.y);
    const ov = bounds1.y > bounds2.y ? overlap : -overlap;

    if (
      (ov < 0 && bounds1.y + bounds1.height * 0.5 > bounds2.y + bounds2.height * 0.5) ||
      (ov > 0 && bounds1.y + bounds1.height * 0.5 < bounds2.y + bounds2.height * 0.5)
    ) {
      return false;
    }

    const delta = bounds1.y - body1.lastPos.y;

    if (overlap > Math.abs(delta) + OVERLAP_PADDING && delta !== 0) {
      overlap = 0;
    }
    overlap = bounds1.y > bounds2.y ? overlap : -overlap;

    if (overlap === 0) {
      return false;
    }

    if (overlap > 0) {
      if (body1.velocity.y > 0 || !body1.canCollide.has(Collide.TOP) || !body2.canCollide.has(Collide.BOTTOM)) {
        return false;
      }

      body1.touching.add(Collide.TOP);
      body2.touching.add(Collide.BOTTOM);
    } else {
      if (body1.velocity.y < 0 || !body1.canCollide.has(Collide.BOTTOM) || !body2.canCollide.has(Collide.TOP)) {
        return false;
      }

      body1.touching.add(Collide.BOTTOM);
      body2.touching.add(Collide.TOP);
    }

    if (body2.bodyType !== 'dynamic') {
      bounds1.y += overlap;
      body1.velocity.y = -body1.velocity.y * body1.bounce;
    } else {
      overlap *= 0.5;
      bounds1.y += overlap;
      bounds2.y -= overlap;

      let velocity1 = body2.velocity.y;
      let velocity2 = body1.velocity.y;
      const average = (velocity1 + velocity2) * 0.5;

      velocity1 -= average;
      velocity2 -= average;
      body1.velocity.y = average + velocity1 * body1.bounce;
      body2.velocity.y = average + velocity2 * body2.bounce;
    }

    return true;
  }

  private intersects(body1: CPhysicsBody, body2: CPhysicsBody): boolean {
    return body1.bounds.intersects(body2.bounds);
  }

  private updateBodyBounds(entity: Entity): void {
    const body = entity.getComponent(CPhysicsBody);
    const transform = entity.getComponent(CTransform);

    const worldPos = transform.getWorldPosition();
    body.bounds.x = worldPos.x - body.bounds.width * 0.5 + body.offset.x;
    body.bounds.y = worldPos.y - body.bounds.height * 0.5 + body.offset.y;

    body.lastPos.x = body.bounds.x;
    body.lastPos.y = body.bounds.y;
    worldPos.put();
  }

  private updateTransform(entity: Entity): void {
    const body = entity.getComponent(CPhysicsBody);
    if (body.bodyType === 'static') {
      return;
    }

    const worldPos = Vec2.get(body.bounds.centerX - body.offset.x, body.bounds.centerY - body.offset.y);
    entity.getComponent(CTransform).setWorldPosition(worldPos);
    worldPos.put();
  }
}
