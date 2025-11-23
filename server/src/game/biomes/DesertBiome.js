const Biome = require('./Biome');
const Types = require('../Types');

class DesertBiome extends Biome {
  constructor(game, definition) {
    super(game, Types.Biome.Desert, definition);
    this.zIndex = 1;
  }

  applyEffects(player) {
    // Neutral biome - no special effects
  }

  collides(player, response) {
    // No collision effects
  }
}

module.exports = DesertBiome;
