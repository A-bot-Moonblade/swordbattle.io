const { Vector } = require('sat');
const Entity = require('./Entity');
const Polygon = require('../shapes/Polygon');
const Health = require('../components/Health');
const Types = require('../Types');
const helpers = require('../../helpers');

// size, coins, health, weight
const rarities = [
  [370, 100, 1, 75], 
  [520, 200, 30, 10],
  [520, 250, 50, 10],
  [750, 850, 200, 4],
  [1050, 2200, 430, 3],
  [1500, 6000, 2000, 1.5],
  [2000, 12000, 1000, 0.3],
];

let totalWeight = rarities.reduce((acc, rarity) => acc + rarity[3], 0);

class Chest extends Entity {
  static defaultDefinition = {
    forbiddenBiomes: [Types.Biome.River],
    forbiddenEntities: [Types.Entity.IceSpike],
  };

  constructor(game, objectData) {
    super(game, Types.Entity.Chest, objectData);

    let rand = helpers.randomInteger(0, totalWeight - 1);
    this.rarity = rarities.findIndex(rarity => {
      rand -= rarity[3];
      return rand < 0;
    });

    this.size = rarities[this.rarity][0];
    this.coins = rarities[this.rarity][1];
    this.health = new Health(rarities[this.rarity][2], 0);

    this.shape = Polygon.createFromRectangle(0, 0, this.size, this.size * 0.6);
    this.targets.push(Types.Entity.Sword);

    // Despawn coin after 10 minutes
    this.despawnTime = Date.now() + (1000 * 60 * 10);

    this.spawn();
  }

  update() {
    if (Date.now() > this.despawnTime) {
      if(this.respawnable) this.createInstance();
      this.remove();
    }
  }

  processTargetsCollision(sword) {
    if (!sword.canCollide(this)) return;

    sword.collidedEntities.add(this);
    this.health.damaged(sword.damage.value);
    if (this.health.isDead) {
      sword.player.flags.set(Types.Flags.ChestDestroy, true);

      this.game.map.spawnCoinsInShape(this.shape, this.coins);

      if (this.respawnable) this.createInstance();
      this.remove();
    } else {
      sword.player.flags.set(Types.Flags.ChestHit, true);
    }
  }

  createState() {
    const state = super.createState();
    state.size = this.size;
    state.rarity = this.rarity;
    return state;
  }
}

module.exports = Chest;
