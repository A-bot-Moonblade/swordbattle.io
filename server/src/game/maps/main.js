const Types = require('../Types');

module.exports = {
  coinsCount: 0,
  aiPlayersCount: 20,
  biomes: [
    // Central Island (replaces old safezone)
    {
      type: Types.Biome.Island,
      pos: [0, 0],
      radius: 4000,
      objects: [
        {
          type: Types.Entity.Bush,
          amount: 80,
          position: 'random',
          size: [100, 400],
        },
        {
          type: Types.Entity.Rock,
          amount: 15,
          position: 'random',
          size: [200, 400],
        },
        {
          type: Types.Entity.Chest,
          amount: 25,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Coin,
          amount: 300,
          position: 'random',
          respawnable: true,
        }
      ],
    },

    // 4 Spawnzones (one in each corner)
    // Top-left corner spawnzone
    {
      type: Types.Biome.Safezone,
      pos: [-22000, -22000],
      radius: 2000,
      objects: [],
    },
    // Top-right corner spawnzone
    {
      type: Types.Biome.Safezone,
      pos: [22000, -22000],
      radius: 2000,
      objects: [],
    },
    // Bottom-left corner spawnzone
    {
      type: Types.Biome.Safezone,
      pos: [-22000, 22000],
      radius: 2000,
      objects: [],
    },
    // Bottom-right corner spawnzone
    {
      type: Types.Biome.Safezone,
      pos: [22000, 22000],
      radius: 2000,
      objects: [],
    },

    // 4 Rivers from corners to center
    // Northwest corner to center
    {
      type: Types.Biome.River,
      pos: [-30000, -30000],
      points: [
        [0, 0],
        [3000, 0],
        [28000, 26000],
        [30000, 28000],
        [30000, 30000],
        [0, 30000],
      ],
      objects: [
        {
          type: Types.Entity.Fish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        },
        {
          type: Types.Entity.AngryFish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        }
      ]
    },
    // Northeast corner to center
    {
      type: Types.Biome.River,
      pos: [30000, -30000],
      points: [
        [0, 0],
        [0, 3000],
        [-26000, 28000],
        [-28000, 30000],
        [-30000, 30000],
        [-30000, 0],
      ],
      objects: [
        {
          type: Types.Entity.Fish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        },
        {
          type: Types.Entity.AngryFish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        }
      ],
    },
    // Southwest corner to center
    {
      type: Types.Biome.River,
      pos: [-30000, 30000],
      points: [
        [0, 0],
        [3000, 0],
        [28000, -26000],
        [30000, -28000],
        [30000, -30000],
        [0, -30000],
      ],
      objects: [
        {
          type: Types.Entity.Fish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        },
        {
          type: Types.Entity.AngryFish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        }
      ],
    },
    // Southeast corner to center
    {
      type: Types.Biome.River,
      pos: [30000, 30000],
      points: [
        [0, 0],
        [0, -3000],
        [-26000, -28000],
        [-28000, -30000],
        [-30000, -30000],
        [-30000, 0],
      ],
      objects: [
        {
          type: Types.Entity.Fish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        },
        {
          type: Types.Entity.AngryFish,
          amount: 8,
          position: 'random',
          respawnable: true,
          size: [53, 73],
        }
      ],
    },

    // Top Triangle - Ice Biome
    {
      type: Types.Biome.Ice,
      pos: [-30000, -30000],
      points: [
        [0, 0],
        [60000, 0],
        [30000, 30000],
      ],
      objects: [
        {
          type: Types.Entity.IceMound,
          amount: 70,
          position: 'random',
          size: [300, 700],
        },
        {
          type: Types.Entity.IceSpike,
          amount: 40,
          position: 'random',
          size: [200, 600],
        },
        {
          type: Types.Entity.IcePond,
          amount: 22,
          position: 'random',
          size: [600, 900],
        },
        {
          type: Types.Entity.IcePond,
          amount: 2,
          position: 'random',
          size: 3000,
        },
        {
          type: Types.Entity.Yeti,
          amount: 12,
          position: 'random',
          respawnable: true,
          size: [80, 110],
        },
        {
          type: Types.Entity.Wolf,
          amount: 12,
          position: 'random',
          respawnable: true,
          size: [85, 105],
        },
        {
          type: Types.Entity.Yeti,
          amount: 2,
          position: 'random',
          respawnable: true,
          respawnTime: [60 * 7, 60 * 17], // 7-17 minutes
          size: [300, 400],
          health: 750,
          isBoss: true,
          damage: 4,
          speed: 20,
        },
        {
          type: Types.Entity.Chest,
          amount: 40,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Coin,
          amount: 1000,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Rock,
          amount: 10,
          position: 'random',
          size: [200, 400],
        },
      ],
    },

    // Right Triangle - Fire Biome
    {
      type: Types.Biome.Fire,
      pos: [30000, -30000],
      points: [
        [0, 0],
        [0, 60000],
        [-30000, 30000],
      ],
      objects: [
        {
          type: Types.Entity.LavaRock,
          amount: 14,
          position: 'random',
          size: [300, 600],
        },
        {
          type: Types.Entity.LavaPool,
          amount: 60,
          position: 'random',
          size: [200, 700],
        },
        {
          type: Types.Entity.LavaPool,
          amount: 2,
          position: 'random',
          size: 5000,
        },
        {
          type: Types.Entity.Chimera,
          amount: 14,
          position: 'random',
          respawnable: true,
          size: [70, 120],
        },
        {
          type: Types.Entity.Roku,
          amount: 2,
          position: 'random',
          respawnable: true,
          respawnTime: [60 * 10, 60 * 15], // 10-15 minutes
          size: [500, 600],
          health: 1000,
          isBoss: true,
          damage: 20,
          rotationSpeed: 5,
          fireballSize: 100,
        },
        {
          type: Types.Entity.Rock,
          amount: 10,
          position: 'random',
          size: [200, 400],
        },
        {
          type: Types.Entity.Chest,
          amount: 40,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Coin,
          amount: 1000,
          position: 'random',
          respawnable: true,
        }
      ],
    },

    // Bottom Triangle - Earth Biome
    {
      type: Types.Biome.Earth,
      pos: [-30000, 30000],
      points: [
        [0, 0],
        [60000, 0],
        [30000, -30000],
      ],
      objects: [
        {
          type: Types.Entity.MossyRock,
          amount: 20,
          position: 'random',
          size: [500, 700],
        },
        {
          type: Types.Entity.Bush,
          amount: 320,
          position: 'random',
          size: [100, 400],
        },
        {
          type: Types.Entity.Pond,
          amount: 2,
          position: 'random',
          size: 4500,
        },
        {
          type: Types.Entity.Pond,
          amount: 40,
          position: 'random',
          size: [400, 900],
        },
        {
          type: Types.Entity.Coin,
          amount: 1000,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Wolf,
          amount: 18,
          position: 'random',
          respawnable: true,
          size: [85, 105],
        },
        {
          type: Types.Entity.Cat,
          amount: 22,
          position: 'random',
          respawnable: true,
          size: [70, 90],
        },
        {
          type: Types.Entity.Bunny,
          amount: 36,
          position: 'random',
          respawnable: true,
          size: [40, 60],
        },
        {
          type: Types.Entity.Rock,
          amount: 20,
          position: 'random',
          size: [200, 400],
        },
        {
          type: Types.Entity.Moose,
          amount: 10,
          position: 'random',
          respawnable: true,
          size: [190, 250],
        },
        {
          type: Types.Entity.Chest,
          amount: 36,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Ancient,
          amount: 6,
          position: 'random',
          respawnable: true,
          respawnTime: [60 * 5, 60 * 15], // 5-15 minutes
          size: [275, 375],
          health: 800,
          isBoss: true,
          damage: 20,
          rotationSpeed: 10,
          swordSize: 100,
          boulderSize: 200,
        },
      ],
    },

    // Left Triangle - Ice Biome (second ice biome for symmetry)
    {
      type: Types.Biome.Ice,
      pos: [30000, 30000],
      points: [
        [0, 0],
        [0, -60000],
        [-30000, -30000],
      ],
      objects: [
        {
          type: Types.Entity.IceMound,
          amount: 70,
          position: 'random',
          size: [300, 700],
        },
        {
          type: Types.Entity.IceSpike,
          amount: 40,
          position: 'random',
          size: [200, 600],
        },
        {
          type: Types.Entity.IcePond,
          amount: 22,
          position: 'random',
          size: [600, 900],
        },
        {
          type: Types.Entity.IcePond,
          amount: 2,
          position: 'random',
          size: 3000,
        },
        {
          type: Types.Entity.Yeti,
          amount: 12,
          position: 'random',
          respawnable: true,
          size: [80, 110],
        },
        {
          type: Types.Entity.Wolf,
          amount: 12,
          position: 'random',
          respawnable: true,
          size: [85, 105],
        },
        {
          type: Types.Entity.Yeti,
          amount: 2,
          position: 'random',
          respawnable: true,
          respawnTime: [60 * 7, 60 * 17], // 7-17 minutes
          size: [300, 400],
          health: 750,
          isBoss: true,
          damage: 4,
          speed: 20,
        },
        {
          type: Types.Entity.Chest,
          amount: 40,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Coin,
          amount: 1000,
          position: 'random',
          respawnable: true,
        },
        {
          type: Types.Entity.Rock,
          amount: 10,
          position: 'random',
          size: [200, 400],
        },
      ],
    },
  ],
};
