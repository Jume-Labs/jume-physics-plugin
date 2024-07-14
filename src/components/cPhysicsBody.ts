import { BaseComponentProps, Component, Rectangle, Vec2 } from '@jume-labs/jume-engine';

import { Collide, CollisionFilter, Touching } from '../physics/interactionTypes.js';

export type BodyType = 'dynamic' | 'kinematic' | 'static';

type XY = {
  x: number;
  y: number;
};

export interface BodyProps {
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
