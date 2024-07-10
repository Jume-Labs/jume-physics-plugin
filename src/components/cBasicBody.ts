import { Component, Rectangle, Vec2 } from '@jume-labs/jume-engine';

import { Collide, CollisionFilter, Touching } from '../physics/interactionTypes';

export type BodyType = 'dynamic' | 'kinematic' | 'static';

type XY = {
  x: number;
  y: number;
};

export interface BodyOptions {
  bodyType?: BodyType;
  active?: boolean;
  isTrigger?: boolean;
  pos?: XY;
  width?: number;
  height?: number;
  drag?: XY;
  velocity?: XY;
  maxVelocity?: XY;
  acceleration?: XY;
  offset?: XY;
  group?: CollisionFilter;
  mask?: CollisionFilter;
  canCollide?: Collide;
  bounce?: number;
  useGravity?: boolean;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any;
}

export class CBasicBody extends Component {
  bodyType: BodyType = 'dynamic';

  isTrigger = false;

  bounce = 0;

  useGravity = true;

  lastPos = new Vec2();

  collidingWith: CBasicBody[] = [];
  wasCollidingWith: CBasicBody[] = [];
  triggeredBy: CBasicBody[] = [];
  wasTriggeredBy: CBasicBody[] = [];

  group = new CollisionFilter(CollisionFilter.GROUP_01);

  mask = new CollisionFilter(CollisionFilter.GROUP_01);

  touching = new Touching(Touching.NONE);

  wasTouching = new Touching(Touching.NONE);

  canCollide = new Collide(Collide.NONE);

  bounds = new Rectangle();

  drag = new Vec2();

  velocity = new Vec2();

  maxVelocity = new Vec2();

  acceleration = new Vec2();

  offset = new Vec2();

  tags: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any;

  init(options?: BodyOptions): CBasicBody {
    if (!options) {
      options = {
        bodyType: 'dynamic',
        active: true,
        isTrigger: false,
        pos: { x: 0, y: 0 },
        width: 10,
        height: 10,
        bounce: 0,
        useGravity: true,
        drag: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        maxVelocity: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        group: new CollisionFilter(CollisionFilter.GROUP_01),
        mask: new CollisionFilter(CollisionFilter.GROUP_01),
        canCollide: new Collide(Collide.ALL),
        tags: [],
      };
    }

    if (options.bodyType) {
      this.bodyType = options.bodyType;
    }

    if (options.active) {
      this.active = options.active;
    }

    if (options.isTrigger) {
      this.isTrigger = options.isTrigger;
    }

    this.bounds.set(options.pos!.x ?? 0, options.pos!.y ?? 0, options.width ?? 10, options.height ?? 0);

    if (options.bounce) {
      this.bounce = options.bounce;
    }

    if (options.useGravity !== undefined) {
      this.useGravity = options.useGravity;
    }

    if (options.drag) {
      this.drag.set(options.drag.x, options.drag.y);
    }

    if (options.velocity) {
      this.velocity.set(options.velocity.x, options.velocity.y);
    }

    if (options.maxVelocity) {
      this.maxVelocity.set(options.maxVelocity.x, options.maxVelocity.y);
    }

    if (options.acceleration) {
      this.acceleration.set(options.acceleration.x, options.acceleration.y);
    }

    if (options.offset) {
      this.offset.set(options.offset.x, options.offset.y);
    }

    if (options.group) {
      this.group = options.group;
    }

    if (options.mask) {
      this.mask = options.mask;
    }

    if (options.canCollide) {
      this.canCollide = options.canCollide;
    }

    if (options.tags) {
      this.tags = options.tags;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.userData = options.userData;

    return this;
  }
}
