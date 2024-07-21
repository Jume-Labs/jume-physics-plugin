import { BaseComponentProps, Component, Rectangle, Vec2 } from '@jume-labs/jume-engine';

import { Collide, CollisionFilter, Touching } from '../physics/interactionTypes.js';

/**
 * Type of collision body available.
 */
export type BodyType = 'dynamic' | 'kinematic' | 'static';

type XY = {
  x: number;
  y: number;
};

/**
 * The setup properties of the CPhysicsBody component.
 */
export interface CPhysicsBodyProps {
  /**
   * The type of body. Default is 'dynamic'.
   */
  bodyType?: BodyType;

  /**
   * Start the body as active. Default is true.
   */
  active?: boolean;

  /**
   * Is this a trigger body. Default is false.
   */
  isTrigger?: boolean;

  /**
   * The world position of the body in pixels.
   */
  pos?: XY;

  /**
   * The width of the body in pixels.
   */
  width?: number;

  /**
   * The height of the body in pixels.
   */
  height?: number;

  /**
   * The body horizontal and vertical drag.
   */
  drag?: XY;

  /**
   * The start velocity.
   */
  velocity?: XY;

  /**
   * The maximum limit of the velocity.
   */
  maxVelocity?: XY;

  /**
   * The acceleration of the body.
   */
  acceleration?: XY;

  /**
   * The body offset from the center.
   */
  offset?: XY;

  /**
   * The group to filter on. Defaults to GROUP_01.
   */
  group?: CollisionFilter;

  /**
   * The mask to filter on. Defaults to GROUP_01.
   */
  mask?: CollisionFilter;

  /**
   * The side this body can collide on. Defaults to ALL.
   */
  canCollide?: Collide;

  /**
   * The amount of bounce. (0 - 1).
   */
  bounce?: number;

  /**
   * Should this body be moved by the world gravity.
   */
  useGravity?: boolean;

  /**
   * Interaction event tags.
   */
  tags?: string[];

  /**
   * Any extra data to add to the component if needed.
   */
  userData?: unknown;
}

export class CPhysicsBody extends Component {
  bodyType: BodyType = 'dynamic';

  isTrigger = false;

  bounce = 0;

  useGravity = true;

  lastPos = new Vec2();

  collidingWith: CPhysicsBody[] = [];
  wasCollidingWith: CPhysicsBody[] = [];
  triggeredBy: CPhysicsBody[] = [];
  wasTriggeredBy: CPhysicsBody[] = [];

  group = new CollisionFilter(CollisionFilter.GROUP_01);

  mask = new CollisionFilter(CollisionFilter.GROUP_01);

  touching = new Touching(Touching.NONE);

  wasTouching = new Touching(Touching.NONE);

  canCollide = new Collide(Collide.ALL);

  bounds = new Rectangle();

  drag = new Vec2();

  velocity = new Vec2();

  maxVelocity = new Vec2();

  acceleration = new Vec2();

  offset = new Vec2();

  tags: string[] = [];

  userData: unknown;

  constructor(base: BaseComponentProps, props: CPhysicsBodyProps) {
    super(base);

    const {
      acceleration,
      active,
      bodyType,
      bounce,
      canCollide,
      drag,
      group,
      height,
      isTrigger,
      mask,
      maxVelocity,
      offset,
      pos,
      tags,
      useGravity,
      userData,
      width,
      velocity,
    } = props;

    if (bodyType) {
      this.bodyType = bodyType;
    }

    this.active = active !== undefined ? active : true;

    if (isTrigger) {
      this.isTrigger = isTrigger;
    }

    this.bounds.set(pos?.x ?? 0, pos?.y ?? 0, width ?? 10, height ?? 0);

    if (bounce) {
      this.bounce = bounce;
    }

    if (useGravity !== undefined) {
      this.useGravity = useGravity;
    }

    if (drag) {
      this.drag.set(drag.x, drag.y);
    }

    if (velocity) {
      this.velocity.set(velocity.x, velocity.y);
    }

    if (maxVelocity) {
      this.maxVelocity.set(maxVelocity.x, maxVelocity.y);
    }

    if (acceleration) {
      this.acceleration.set(acceleration.x, acceleration.y);
    }

    if (offset) {
      this.offset.set(offset.x, offset.y);
    }

    if (group) {
      this.group = group;
    }

    if (mask) {
      this.mask = mask;
    }

    if (canCollide) {
      this.canCollide = canCollide;
    }

    if (tags) {
      this.tags = tags;
    }

    this.userData = userData;

    return this;
  }
}
