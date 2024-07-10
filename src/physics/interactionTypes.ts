import { Bitset } from '@jume-labs/jume-engine';

export class Collide extends Bitset {
  static readonly NONE = 0b0000;
  static readonly LEFT = 0b0001;
  static readonly RIGHT = 0b0010;
  static readonly TOP = 0b0100;
  static readonly BOTTOM = 0b1000;
  static readonly ALL = 0b1111;
}

export class Touching extends Bitset {
  static readonly NONE = 0b0000;
  static readonly LEFT = 0b0001;
  static readonly RIGHT = 0b0010;
  static readonly TOP = 0b0100;
  static readonly BOTTOM = 0b1000;
}

export class CollisionFilter extends Bitset {
  static readonly GROUP_01 = 0b0000000000000001;
  static readonly GROUP_02 = 0b0000000000000010;
  static readonly GROUP_03 = 0b0000000000000100;
  static readonly GROUP_04 = 0b0000000000001000;
  static readonly GROUP_05 = 0b0000000000010000;
  static readonly GROUP_06 = 0b0000000000100000;
  static readonly GROUP_07 = 0b0000000001000000;
  static readonly GROUP_08 = 0b0000000010000000;
  static readonly GROUP_09 = 0b0000000100000000;
  static readonly GROUP_10 = 0b0000001000000000;
  static readonly GROUP_11 = 0b0000010000000000;
  static readonly GROUP_12 = 0b0000100000000000;
  static readonly GROUP_13 = 0b0001000000000000;
  static readonly GROUP_14 = 0b0010000000000000;
  static readonly GROUP_15 = 0b0100000000000000;
  static readonly GROUP_16 = 0b1000000000000000;
}

export type InteractionType =
  | 'triggerStart'
  | 'triggerStay'
  | 'triggerEnd'
  | 'collisionStart'
  | 'collisionStay'
  | 'collisionEnd';
