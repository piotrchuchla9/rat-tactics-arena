
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  z: number;
}

export type TowerType = 'sniper' | 'shotgun' | 'gasBomber' | 'sword' | 'wizard';

export interface Tower {
  id: string;
  type: TowerType;
  position: Vector3;
  level: number;
  damage: number;
  range: number;
  attackSpeed: number;
  cost: number;
  upgradeCost: number;
  lastAttackTime: number;
  target?: Enemy;
}

export interface Enemy {
  id: string;
  position: Vector3;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
  pathProgress: number;
  isDead: boolean;
  type: 'basic' | 'fast' | 'heavy' | 'boss';
}

export interface Wave {
  enemies: Array<{
    type: Enemy['type'];
    count: number;
    spawnDelay: number;
  }>;
  waveNumber: number;
}

export interface GameState {
  gold: number;
  lives: number;
  currentWave: number;
  score: number;
  towers: Tower[];
  enemies: Enemy[];
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
}

export interface User {
  id: string;
  email: string;
  totalGold: number;
  highScore: number;
  unlockedTowers: TowerType[];
  towerUpgrades: Record<TowerType, number>;
  createdAt: Date;
}

export interface TowerStats {
  name: string;
  description: string;
  baseDamage: number;
  baseRange: number;
  baseAttackSpeed: number;
  baseCost: number;
  upgradeMultiplier: number;
  maxLevel: number;
  ability: string;
}

export const TOWER_CONFIGS: Record<TowerType, TowerStats> = {
  sniper: {
    name: 'Sniper Rat',
    description: 'Long-range precision attacker with a sniper rifle',
    baseDamage: 50,
    baseRange: 8,
    baseAttackSpeed: 2000,
    baseCost: 100,
    upgradeMultiplier: 1.5,
    maxLevel: 5,
    ability: 'Piercing Shot - bullets go through multiple enemies'
  },
  shotgun: {
    name: 'Shotgun Rat',
    description: 'Close-range damage dealer with a shotgun',
    baseDamage: 30,
    baseRange: 3,
    baseAttackSpeed: 800,
    baseCost: 75,
    upgradeMultiplier: 1.4,
    maxLevel: 5,
    ability: 'Spread Shot - hits multiple enemies in cone'
  },
  gasBomber: {
    name: 'Gas Bomber Rat',
    description: 'Throws explosive gas bombs causing area damage',
    baseDamage: 40,
    baseRange: 5,
    baseAttackSpeed: 1500,
    baseCost: 120,
    upgradeMultiplier: 1.6,
    maxLevel: 5,
    ability: 'Poison Cloud - leaves damaging gas cloud'
  },
  sword: {
    name: 'Sword Rat',
    description: 'Melee defender that blocks and attacks enemies on the path',
    baseDamage: 25,
    baseRange: 1.5,
    baseAttackSpeed: 500,
    baseCost: 50,
    upgradeMultiplier: 1.3,
    maxLevel: 5,
    ability: 'Block - slows enemies passing by'
  },
  wizard: {
    name: 'Wizard Rat',
    description: 'Casts magical projectiles and buffs nearby towers',
    baseDamage: 35,
    baseRange: 6,
    baseAttackSpeed: 1200,
    baseCost: 150,
    upgradeMultiplier: 1.7,
    maxLevel: 5,
    ability: 'Magic Buff - increases nearby tower damage'
  }
};
