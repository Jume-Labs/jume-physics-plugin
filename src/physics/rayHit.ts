import { distance as mathDistance, removeByValue } from '@jume-labs/jume-engine';

import { CPhysicsBody } from '../components/cPhysicsBody.js';

export class RayHit {
  distance: number;

  x: number;

  y: number;

  body?: CPhysicsBody;

  private static readonly POOL: RayHit[] = [];

  static get(x: number, y: number, originX: number, originY: number, body?: CPhysicsBody): RayHit {
    if (RayHit.POOL.length > 0) {
      const hit = RayHit.POOL.pop()!;
      hit.x = x;
      hit.y = y;
      hit.body = body;
      hit.distance = mathDistance(originX, originY, x, y);

      return hit;
    } else {
      return new RayHit(x, y, originX, originY, body);
    }
  }

  constructor(x: number, y: number, originX: number, originY: number, body?: CPhysicsBody) {
    this.x = x;
    this.y = y;
    this.body = body;
    this.distance = mathDistance(originX, originY, x, y);
  }

  put(): void {
    RayHit.POOL.push(this);
  }
}

export class RayHitList {
  get hits(): RayHit[] {
    return this._hits;
  }

  get count(): number {
    return this.hits.length;
  }

  get first(): RayHit | undefined {
    return this._hits[0];
  }

  get last(): RayHit | undefined {
    return this._hits[this._hits.length - 1];
  }

  private _hits: RayHit[] = [];

  constructor() {}

  insert(x: number, y: number, originX: number, originY: number, body?: CPhysicsBody): void {
    const hit = RayHit.get(x, y, originX, originY, body);

    if (this._hits.length > 0) {
      if (this._hits.length === 1) {
        const first = this._hits[0];
        if (hit.distance < first.distance) {
          this._hits.unshift(hit);
        } else {
          this._hits.push(hit);
        }
      } else {
        for (let i = 0; i < this._hits.length; i++) {
          const item = this._hits[i];
          if (item.distance > hit.distance) {
            if (i === this._hits.length - 1) {
              this._hits.push(hit);
            } else {
              this._hits.splice(i, 0, hit);
            }
          }
        }
      }
    } else {
      this._hits.push(hit);
    }
  }

  filterOnTags(tags: string[]): void {
    this._hits = this._hits.filter((hit) => {
      for (const tag of tags) {
        if (hit.body && hit.body.tags.includes(tag)) {
          return true;
        }
      }

      return false;
    });
  }

  remove(hit: RayHit): void {
    removeByValue(this._hits, hit);
  }

  clear(): void {
    while (this._hits.length > 0) {
      this._hits.pop();
    }
  }
}
