import { Event, EventType } from '@jume-labs/jume-engine';

import { CBasicBody } from '../components/cBasicBody';

export class PhysicsEvent extends Event {
  static readonly TRIGGER_START = new EventType(PhysicsEvent, 'jume_physics_trigger_start');

  static readonly TRIGGER_STAY = new EventType(PhysicsEvent, 'jume_physics_trigger_stay');

  static readonly TRIGGER_END = new EventType(PhysicsEvent, 'jume_physics_trigger_end');

  static readonly COLLISION_START = new EventType(PhysicsEvent, 'jume_physics_collision_start');
  static readonly COLLISION_STAY = new EventType(PhysicsEvent, 'jume_physics_collision_stay');
  static readonly COLLISION_END = new EventType(PhysicsEvent, 'jume_physics_collision_end');

  body1!: CBasicBody;

  body2!: CBasicBody;

  private static readonly POOL: PhysicsEvent[] = [];

  static get(type: EventType<PhysicsEvent>, body1: CBasicBody, body2: CBasicBody): PhysicsEvent {
    const event = PhysicsEvent.POOL.length > 0 ? PhysicsEvent.POOL.pop()! : new PhysicsEvent();
    event._name = type.name;
    event.body1 = body1;
    event.body2 = body2;

    return event;
  }

  override put(): void {
    super.put();
  }
}
