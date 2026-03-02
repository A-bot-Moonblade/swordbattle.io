import { BaseEntity } from '../entities/BaseEntity';
import Game from '../scenes/Game';

interface ArmorOptions {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  hideWhenFull: boolean;
  alwaysHide: boolean;
  line: number;
}

const defaultOptions: ArmorOptions = {
  width: 200,
  height: 15, // Half the height of health bar
  hideWhenFull: true,
  offsetX: 0,
  offsetY: 0,
  alwaysHide: false,
  line: 4
};

export class Armor {
  game: Game;
  entity: BaseEntity;
  bar: Phaser.GameObjects.Graphics;
  options: ArmorOptions;
  value: number;
  hidden = false;
  internalHidden = false;
  alwaysHide = false;

  constructor(entity: any, options: Partial<ArmorOptions> = {}) {
    this.options = Object.assign({}, defaultOptions, options);

    this.game = entity.game;
    this.entity = entity;
    this.value = entity.armorPercent || 0;
    this.bar = this.game.add.graphics().setDepth(29);
    this.game.add.existing(this.bar);
    this.alwaysHide = this.options.alwaysHide;
  }

  update(dt: number) {
    if(this.alwaysHide) return;
    this.value = Phaser.Math.Linear(this.value, this.entity.armorPercent || 0, dt / 60);

    if (!this.hidden) {
      const shouldHide = this.value > 0.98;
      if (this.options.hideWhenFull && shouldHide !== this.internalHidden) {
        this.game.add.tween({
          targets: this.bar,
          alpha: shouldHide ? 0 : 1,
          duration: 500,
        });
        this.internalHidden = shouldHide;
      }
    }

    const scale = this.entity.container.scale;
    const width = this.options.width * scale;
    const height = this.options.height * scale;
    const line = this.options.line;

    this.bar.setPosition(
      (this.entity.container.x - width / 2) + this.options.offsetX * scale,
      this.entity.container.y + this.options.offsetY * scale,
    );

    if (this.hidden || this.internalHidden) return;

    // Cyan blue color for armor
    const armorColor = 0x00FFFF;

    this.bar.clear();
    this.bar.lineStyle(line, 0x000000);
    this.bar.strokeRect(0, 0, width, height);
    this.bar.fillStyle(armorColor);
    this.bar.fillRect(0, 0, width * this.value, height);
  }

  destroy() {
    this.bar.destroy();
    this.entity.armorBar = undefined;
  }
}
