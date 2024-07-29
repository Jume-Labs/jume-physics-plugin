import { Event, EventType } from '@jume-labs/jume-engine';

import { CPhysicsBody } from '../components/cPhysicsBody.js';

type PhysicsEventType =
  | 'collision start'
  | 'collision stay'
  | 'collision end'
  | 'trigger start'
  | 'trigger stay'
  | 'trigger end';

export class PhysicsEvent extends Event {
  static readonly TRIGGER_START = new EventType(PhysicsEvent, 'jume_physics_trigger_start');
  static readonly TRIGGER_STAY = new EventType(PhysicsEvent, 'jume_physics_trigger_stay');
  static readonly TRIGGER_END = new EventType(PhysicsEvent, 'jume_physics_trigger_end');

  static readonly COLLISION_START = new EventType(PhysicsEvent, 'jume_physics_collision_start');
  static readonly COLLISION_STAY = new EventType(PhysicsEvent, 'jume_physics_collision_stay');
  static readonly COLLISION_END = new EventType(PhysicsEvent, 'jume_physics_collision_end');

  body1!: CPhysicsBody;

  body2!: CPhysicsBody;

  private static readonly POOL: PhysicsEvent[] = [];

  private static readonly TYPE_MAP: Record<PhysicsEventType, EventType<PhysicsEvent>> = {
    'collision start': PhysicsEvent.COLLISION_START,
    'collision stay': PhysicsEvent.COLLISION_STAY,
    'collision end': PhysicsEvent.COLLISION_END,
    'trigger start': PhysicsEvent.TRIGGER_START,
    'trigger stay': PhysicsEvent.TRIGGER_STAY,
    'trigger end': PhysicsEvent.TRIGGER_END,
  };

  static get(type: PhysicsEventType, body1: CPhysicsBody, body2: CPhysicsBody): PhysicsEvent {
    const event = PhysicsEvent.POOL.length > 0 ? PhysicsEvent.POOL.pop()! : new PhysicsEvent();
    event._name = PhysicsEvent.TYPE_MAP[type].name;
    event.body1 = body1;
    event.body2 = body2;

    return event;
  }

  override put(): void {
    super.put();
  }
}
