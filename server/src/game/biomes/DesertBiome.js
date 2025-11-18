const Biome = require('./Biome');
const Types = require('../Types');

class DesertBiome extends Biome {
  constructor(game, definition) {
    super(game, Types.Biome.Desert, definition);
    this.zIndex = 1;
  }

  applyEffects(player) {
    // Desert effects: slightly faster movement, reduced health
    player.speed.multiplier *= 1.05; // +5% speed
    player.health.max.multiplier *= 0.95; // -5% max health
  }

  collides(player, response) {
    // No collision effects
  }
}

module.exports = DesertBiome;
