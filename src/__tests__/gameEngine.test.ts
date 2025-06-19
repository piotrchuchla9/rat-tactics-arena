
import { describe, it, expect, beforeEach } from 'vitest';
import { TOWER_CONFIGS } from '../types/game';

describe('Tower Configurations', () => {
  it('should have valid tower configurations', () => {
    Object.entries(TOWER_CONFIGS).forEach(([type, config]) => {
      expect(config.name).toBeDefined();
      expect(config.baseDamage).toBeGreaterThan(0);
      expect(config.baseRange).toBeGreaterThan(0);
      expect(config.baseAttackSpeed).toBeGreaterThan(0);
      expect(config.baseCost).toBeGreaterThan(0);
      expect(config.upgradeMultiplier).toBeGreaterThan(1);
      expect(config.maxLevel).toBeGreaterThan(0);
    });
  });

  it('should have sniper tower with highest range', () => {
    const sniperRange = TOWER_CONFIGS.sniper.baseRange;
    const otherRanges = Object.entries(TOWER_CONFIGS)
      .filter(([type]) => type !== 'sniper')
      .map(([, config]) => config.baseRange);
    
    expect(sniperRange).toBeGreaterThanOrEqual(Math.max(...otherRanges));
  });

  it('should have sword tower with lowest cost', () => {
    const swordCost = TOWER_CONFIGS.sword.baseCost;
    const otherCosts = Object.entries(TOWER_CONFIGS)
      .filter(([type]) => type !== 'sword')
      .map(([, config]) => config.baseCost);
    
    expect(swordCost).toBeLessThanOrEqual(Math.min(...otherCosts));
  });
});

describe('Game Mechanics', () => {
  it('should calculate tower upgrade costs correctly', () => {
    const tower = TOWER_CONFIGS.sniper;
    const expectedLevel2Cost = Math.round(tower.baseCost * tower.upgradeMultiplier);
    
    expect(expectedLevel2Cost).toBeGreaterThan(tower.baseCost);
  });

  it('should have reasonable attack speeds', () => {
    Object.values(TOWER_CONFIGS).forEach(config => {
      // Attack speed should be between 100ms and 5000ms
      expect(config.baseAttackSpeed).toBeGreaterThanOrEqual(100);
      expect(config.baseAttackSpeed).toBeLessThanOrEqual(5000);
    });
  });
});
