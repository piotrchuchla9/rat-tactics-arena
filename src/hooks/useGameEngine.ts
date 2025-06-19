
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Tower, Enemy, TowerType, TOWER_CONFIGS, Wave } from '../types/game';
import { useAuth } from '../contexts/AuthContext';
import * as THREE from 'three';

const INITIAL_GAME_STATE: GameState = {
  gold: 200,
  lives: 20,
  currentWave: 0,
  score: 0,
  towers: [],
  enemies: [],
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  victory: false,
};

const PATH_POINTS = [
  new THREE.Vector3(-8, 0, 0),
  new THREE.Vector3(-4, 0, 0),
  new THREE.Vector3(-4, 0, 4),
  new THREE.Vector3(0, 0, 4),
  new THREE.Vector3(0, 0, -4),
  new THREE.Vector3(4, 0, -4),
  new THREE.Vector3(4, 0, 0),
  new THREE.Vector3(8, 0, 0),
];

const WAVES: Wave[] = [
  {
    waveNumber: 1,
    enemies: [
      { type: 'basic', count: 5, spawnDelay: 1000 }
    ]
  },
  {
    waveNumber: 2,
    enemies: [
      { type: 'basic', count: 8, spawnDelay: 800 },
      { type: 'fast', count: 2, spawnDelay: 1500 }
    ]
  },
  {
    waveNumber: 3,
    enemies: [
      { type: 'basic', count: 10, spawnDelay: 600 },
      { type: 'fast', count: 5, spawnDelay: 1200 },
      { type: 'heavy', count: 1, spawnDelay: 3000 }
    ]
  },
  {
    waveNumber: 4,
    enemies: [
      { type: 'basic', count: 15, spawnDelay: 500 },
      { type: 'fast', count: 8, spawnDelay: 800 },
      { type: 'heavy', count: 3, spawnDelay: 2000 }
    ]
  },
  {
    waveNumber: 5,
    enemies: [
      { type: 'basic', count: 20, spawnDelay: 400 },
      { type: 'fast', count: 10, spawnDelay: 600 },
      { type: 'heavy', count: 5, spawnDelay: 1500 },
      { type: 'boss', count: 1, spawnDelay: 5000 }
    ]
  }
];

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const gameLoopRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);
  const waveEnemiesRef = useRef<Array<{ type: Enemy['type']; spawnTime: number }>>([]);
  const { user, updateUserProgress } = useAuth();

  const createEnemy = useCallback((type: Enemy['type'], id: string): Enemy => {
    const enemyConfigs = {
      basic: { health: 100, speed: 0.02, reward: 10 },
      fast: { health: 60, speed: 0.04, reward: 15 },
      heavy: { health: 300, speed: 0.01, reward: 25 },
      boss: { health: 1000, speed: 0.015, reward: 100 }
    };

    const config = enemyConfigs[type];
    return {
      id,
      position: { x: PATH_POINTS[0].x, y: 0.5, z: PATH_POINTS[0].z },
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      reward: config.reward,
      pathProgress: 0,
      isDead: false,
      type
    };
  }, []);

  const createTower = useCallback((position: THREE.Vector3, type: TowerType, id: string): Tower => {
    const config = TOWER_CONFIGS[type];
    return {
      id,
      type,
      position: { x: position.x, y: position.y, z: position.z },
      level: 1,
      damage: config.baseDamage,
      range: config.baseRange,
      attackSpeed: config.baseAttackSpeed,
      cost: config.baseCost,
      upgradeCost: Math.round(config.baseCost * config.upgradeMultiplier),
      lastAttackTime: 0,
    };
  }, []);

  const startWave = useCallback(() => {
    const wave = WAVES[gameState.currentWave];
    if (!wave) {
      // Victory condition
      setGameState(prev => ({ 
        ...prev, 
        gameOver: true, 
        victory: true 
      }));
      return;
    }

    const waveEnemies: Array<{ type: Enemy['type']; spawnTime: number }> = [];
    let currentTime = 0;

    wave.enemies.forEach(enemyGroup => {
      for (let i = 0; i < enemyGroup.count; i++) {
        waveEnemies.push({
          type: enemyGroup.type,
          spawnTime: currentTime
        });
        currentTime += enemyGroup.spawnDelay;
      }
    });

    waveEnemiesRef.current = waveEnemies;
    enemySpawnTimerRef.current = 0;

    setGameState(prev => ({
      ...prev,
      currentWave: prev.currentWave + 1,
      isPlaying: true
    }));
  }, [gameState.currentWave]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTime;

    setGameState(prev => {
      let newState = { ...prev };

      // Spawn enemies
      enemySpawnTimerRef.current += deltaTime;
      const enemiesToSpawn = waveEnemiesRef.current.filter(
        enemy => enemy.spawnTime <= enemySpawnTimerRef.current
      );

      if (enemiesToSpawn.length > 0) {
        enemiesToSpawn.forEach(enemyToSpawn => {
          const enemyId = `enemy_${Date.now()}_${Math.random()}`;
          const newEnemy = createEnemy(enemyToSpawn.type, enemyId);
          newState.enemies.push(newEnemy);
        });

        waveEnemiesRef.current = waveEnemiesRef.current.filter(
          enemy => enemy.spawnTime > enemySpawnTimerRef.current
        );
      }

      // Update enemy positions
      newState.enemies = newState.enemies.map(enemy => {
        if (enemy.isDead) return enemy;

        // Move along path
        enemy.pathProgress += enemy.speed * deltaTime;
        const totalPathLength = PATH_POINTS.length - 1;
        const segmentProgress = enemy.pathProgress / totalPathLength;

        if (segmentProgress >= 1) {
          // Enemy reached the end
          newState.lives -= 1;
          enemy.isDead = true;
          
          if (newState.lives <= 0) {
            newState.gameOver = true;
            newState.isPlaying = false;
          }
          return enemy;
        }

        // Interpolate position along path
        const segmentIndex = Math.floor(enemy.pathProgress);
        const segmentT = enemy.pathProgress - segmentIndex;
        
        if (segmentIndex < PATH_POINTS.length - 1) {
          const startPoint = PATH_POINTS[segmentIndex];
          const endPoint = PATH_POINTS[segmentIndex + 1];
          
          enemy.position.x = startPoint.x + (endPoint.x - startPoint.x) * segmentT;
          enemy.position.z = startPoint.z + (endPoint.z - startPoint.z) * segmentT;
        }

        return enemy;
      });

      // Tower attacks
      newState.towers.forEach(tower => {
        if (currentTime - tower.lastAttackTime < tower.attackSpeed) return;

        // Find target
        const enemiesInRange = newState.enemies.filter(enemy => {
          if (enemy.isDead) return false;
          const distance = Math.sqrt(
            Math.pow(enemy.position.x - tower.position.x, 2) +
            Math.pow(enemy.position.z - tower.position.z, 2)
          );
          return distance <= tower.range;
        });

        if (enemiesInRange.length > 0) {
          // Attack first enemy in range
          const target = enemiesInRange[0];
          target.health -= tower.damage;
          tower.lastAttackTime = currentTime;

          if (target.health <= 0) {
            target.isDead = true;
            newState.gold += target.reward;
            newState.score += target.reward * 10;
          }
        }
      });

      // Remove dead enemies
      newState.enemies = newState.enemies.filter(enemy => !enemy.isDead);

      // Check wave completion
      if (newState.enemies.length === 0 && waveEnemiesRef.current.length === 0 && newState.isPlaying) {
        newState.isPlaying = false;
        
        // Check victory condition
        if (newState.currentWave >= WAVES.length) {
          newState.gameOver = true;
          newState.victory = true;
        }
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, createEnemy]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  const placeTower = useCallback((position: THREE.Vector3, type: TowerType) => {
    const config = TOWER_CONFIGS[type];
    if (gameState.gold < config.baseCost) return false;

    const towerId = `tower_${Date.now()}_${Math.random()}`;
    const newTower = createTower(position, type, towerId);

    setGameState(prev => ({
      ...prev,
      towers: [...prev.towers, newTower],
      gold: prev.gold - config.baseCost
    }));

    return true;
  }, [gameState.gold, createTower]);

  const upgradeTower = useCallback((tower: Tower) => {
    const config = TOWER_CONFIGS[tower.type];
    if (gameState.gold < tower.upgradeCost || tower.level >= config.maxLevel) return false;

    setGameState(prev => ({
      ...prev,
      towers: prev.towers.map(t => 
        t.id === tower.id 
          ? {
              ...t,
              level: t.level + 1,
              damage: Math.round(t.damage * config.upgradeMultiplier),
              range: t.range * 1.1,
              attackSpeed: Math.max(t.attackSpeed * 0.9, 200),
              upgradeCost: Math.round(t.upgradeCost * config.upgradeMultiplier)
            }
          : t
      ),
      gold: prev.gold - tower.upgradeCost
    }));

    return true;
  }, [gameState.gold]);

  const sellTower = useCallback((tower: Tower) => {
    const sellValue = Math.round(tower.cost * 0.7);

    setGameState(prev => ({
      ...prev,
      towers: prev.towers.filter(t => t.id !== tower.id),
      gold: prev.gold + sellValue
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    waveEnemiesRef.current = [];
    enemySpawnTimerRef.current = 0;
  }, []);

  // Save progress when game ends
  useEffect(() => {
    if (gameState.gameOver && user) {
      const newTotalGold = user.totalGold + gameState.gold;
      const newHighScore = Math.max(user.highScore, gameState.score);
      
      updateUserProgress({
        totalGold: newTotalGold,
        highScore: newHighScore
      });
    }
  }, [gameState.gameOver, gameState.gold, gameState.score, user, updateUserProgress]);

  return {
    gameState,
    placeTower,
    upgradeTower,
    sellTower,
    startWave,
    pauseGame,
    resetGame
  };
};
