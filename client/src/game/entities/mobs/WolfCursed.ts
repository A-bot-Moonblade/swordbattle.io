import { BaseEntity } from '../BaseEntity';
import { Health } from '../../components/Health';

class WolfCursedMob extends BaseEntity {
  static stateFields = [...BaseEntity.stateFields, 'angle', 'isAngry'];
  static basicAngle = -Math.PI / 2;
  static removeTransition = 500;

  body!: Phaser.GameObjects.Sprite;

  createSprite() {
    this.body = this.game.add.sprite(0, 0, 'wolf-cursed').setOrigin(0.48, 0.6);
    this.updateSprite();
    this.healthBar = new Health(this, { offsetY: -this.shape.radius - 40 });
    this.container = this.game.add.container(this.shape.x, this.shape.y, [this.body]);
    return this.container;
}

export default WolfCursedMob;
