import { BaseEntity } from '../BaseEntity';

class Tree extends BaseEntity {
  static stateFields = [...BaseEntity.stateFields];

  createSprite() {
    this.container = this.game.add.sprite(this.shape.x, this.shape.y, 'tree-cursed');
    this.container.scale = (this.shape.radius * 2 * 1.5) / this.container.width;
    return this.container;
  }
}

export default Tree;
