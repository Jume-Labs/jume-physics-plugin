import { Rectangle, Vec2 } from '@jume-labs/jume-engine';

import { CBasicBody } from '../components/cBasicBody.js';
import { RayHitList } from './rayHit.js';

const MAX_BODIES = 6;

const MAX_DEPTH = 8;

export class QuadNode {
  private static readonly POOL: QuadNode[] = [];

  private depth: number;

  private readonly bodies: CBasicBody[] = [];

  private readonly nodes: QuadNode[] = [];

  private readonly indexList: number[] = [];

  private readonly bounds: Rectangle;

  static get(depth: number, x: number, y: number, width: number, height: number): QuadNode {
    if (QuadNode.POOL.length > 0) {
      const node = QuadNode.POOL.pop()!;
      node.reset(depth, x, y, width, height);

      return node;
    } else {
      return new QuadNode(depth, x, y, width, height);
    }
  }

  constructor(depth: number, x: number, y: number, width: number, height: number) {
    this.depth = depth;
    this.bounds = new Rectangle(x, y, width, height);
  }

  clear(): void {
    while (this.bodies.length > 0) {
      this.bodies.pop();
    }

    while (this.nodes.length > 0) {
      const node = this.nodes.pop()!;
      node.clear();
      node.put();
    }
  }

  reset(depth: number, x: number, y: number, width: number, height: number): void {
    this.depth = depth;
    this.bounds.set(x, y, width, height);
  }

  put(): void {
    QuadNode.POOL.push(this);
  }

  getNodeBounds(list: Rectangle[]): void {
    for (const node of this.nodes) {
      node.getNodeBounds(list);
    }
    list.push(this.bounds);
  }

  insert(body: CBasicBody): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(body.bounds);
      if (index === -1) {
        this.getIndexes(body.bounds, this.indexList);
        for (const i of this.indexList) {
          this.nodes[i].insert(body);
        }
      } else {
        this.nodes[index].insert(body);
      }

      return;
    }

    this.bodies.push(body);

    if (this.bodies.length > MAX_BODIES && this.depth < MAX_DEPTH) {
      this.split();

      while (this.bodies.length > 0) {
        const b = this.bodies.pop()!;
        const index = this.getIndex(b.bounds);
        if (index === -1) {
          this.getIndexes(b.bounds, this.indexList);
          for (const i of this.indexList) {
            this.nodes[i].insert(b);
          }
        } else {
          this.nodes[index].insert(b);
        }
      }
    }
  }

  getBodyList(body: CBasicBody, list: CBasicBody[]): void {
    const index = this.getIndex(body.bounds);
    if (this.nodes.length > 0) {
      if (index === -1) {
        this.getIndexes(body.bounds, this.indexList);
        for (const i of this.indexList) {
          this.nodes[i].getBodyList(body, list);
        }
      } else {
        this.nodes[index].getBodyList(body, list);
      }
    } else {
      for (const b of this.bodies) {
        if (b !== body && !list.includes(b)) {
          list.push(b);
        }
      }
    }
  }

  getLineHitList(startX: number, startY: number, endX: number, endY: number, results: RayHitList): void {
    if (this.nodes.length > 0) {
      this.getLineIndexes(startX, startY, endX, endY, this.indexList);
      for (const index of this.indexList) {
        this.nodes[index].getLineHitList(startX, startY, endX, endY, results);
      }
    } else {
      const hitPos = Vec2.get();
      for (const body of this.bodies) {
        if (body.bounds.intersectsLine(startX, startY, endX, endY, hitPos)) {
          results.insert(hitPos.x, hitPos.y, startX, startY, body);
        }
      }
      hitPos.put();
    }
  }

  private split(): void {
    const subWidth = this.bounds.width * 0.5;
    const subHeight = this.bounds.height * 0.5;
    const x = this.bounds.x;
    const y = this.bounds.y;
    const newDepth = this.depth + 1;

    this.nodes.push(QuadNode.get(newDepth, x, y, subWidth, subHeight));
    this.nodes.push(QuadNode.get(newDepth, x + subWidth, y, subWidth, subHeight));
    this.nodes.push(QuadNode.get(newDepth, x, y + subHeight, subWidth, subHeight));
    this.nodes.push(QuadNode.get(newDepth, x + subWidth, y + subHeight, subWidth, subHeight));
  }

  private getLineIndexes(p1X: number, p1Y: number, p2X: number, p2Y: number, list: number[]): void {
    while (list.length > 0) {
      list.pop();
    }

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeBounds = this.nodes[i].bounds;
      if (
        nodeBounds.intersectsLine(p1X, p1Y, p2X, p2Y) ||
        nodeBounds.hasPoint(p1X, p1Y) ||
        nodeBounds.hasPoint(p2X, p2Y)
      ) {
        list.push(i);
      }
    }
  }

  private getIndexes(colliderBounds: Rectangle, list: number[]): void {
    while (list.length > 0) {
      list.pop();
    }

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeBounds = this.nodes[i].bounds;
      if (nodeBounds.intersects(colliderBounds)) {
        list.push(i);
      }
    }
  }

  private getIndex(colliderBounds: Rectangle): number {
    let index = -1;

    const middleX = this.bounds.x + this.bounds.width * 0.5;
    const middleY = this.bounds.y + this.bounds.height * 0.5;

    const top = colliderBounds.y + colliderBounds.height < middleY;
    const bottom = colliderBounds.y > middleY;
    const left = colliderBounds.x + colliderBounds.width < middleX;
    const right = colliderBounds.x > middleX;

    if (left) {
      if (top) {
        index = 0;
      } else if (bottom) {
        index = 2;
      }
    } else if (right) {
      if (top) {
        index = 1;
      } else if (bottom) {
        index = 3;
      }
    }

    return index;
  }
}

export class QuadTree {
  bounds: Rectangle;

  root: QuadNode;

  private hits = new RayHitList();

  constructor(x: number, y: number, width: number, height: number) {
    this.bounds = new Rectangle(x, y, width, height);
    this.root = new QuadNode(1, x, y, width, height);
  }

  insert(body: CBasicBody): void {
    this.root.insert(body);
  }

  getBodyList(body: CBasicBody, out?: CBasicBody[]): CBasicBody[] {
    if (!out) {
      out = [];
    }

    this.root.getBodyList(body, out);

    return out;
  }

  getLineList(startX: number, startY: number, endX: number, endY: number, out?: RayHitList): RayHitList {
    if (!out) {
      out = this.hits;
    }
    out.clear();

    this.root.getLineHitList(startX, startY, endX, endY, out);

    return out;
  }

  getTreeBounds(out?: Rectangle[]): Rectangle[] {
    if (!out) {
      out = [];
    }

    this.root.getNodeBounds(out);

    return out;
  }

  clear(): void {
    this.root.clear();
    this.root.reset(1, this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }

  updateBounds(x: number, y: number, width: number, height: number): void {
    this.bounds.set(x, y, width, height);
  }

  updatePosition(x: number, y: number): void {
    this.bounds.x = x;
    this.bounds.y = y;
  }
}
