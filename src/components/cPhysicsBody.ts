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
export interface BodyProps {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any;
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

  constructor(base: BaseComponentProps, props: BodyProps) {
    super(base);

    if (props.bodyType) {
      this.bodyType = props.bodyType;
    }

    if (props.active) {
      this.active = props.active;
    }

    if (props.isTrigger) {
      this.isTrigger = props.isTrigger;
    }

    this.bounds.set(props.pos!.x ?? 0, props.pos!.y ?? 0, props.width ?? 10, props.height ?? 0);

    if (props.bounce) {
      this.bounce = props.bounce;
    }

    if (props.useGravity !== undefined) {
      this.useGravity = props.useGravity;
    }

    if (props.drag) {
      this.drag.set(props.drag.x, props.drag.y);
    }

    if (props.velocity) {
      this.velocity.set(props.velocity.x, props.velocity.y);
    }

    if (props.maxVelocity) {
      this.maxVelocity.set(props.maxVelocity.x, props.maxVelocity.y);
    }

    if (props.acceleration) {
      this.acceleration.set(props.acceleration.x, props.acceleration.y);
    }

    if (props.offset) {
      this.offset.set(props.offset.x, props.offset.y);
    }

    if (props.group) {
      this.group = props.group;
    }

    if (props.mask) {
      this.mask = props.mask;
    }

    if (props.canCollide) {
      this.canCollide = props.canCollide;
    }

    if (props.tags) {
      this.tags = props.tags;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.userData = props.userData;

    return this;
  }
}
