
import React from 'react';
import { GameState, TowerType, TOWER_CONFIGS, Tower } from '../../types/game';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface GameUIProps {
  gameState: GameState;
  selectedTower: Tower | null;
  selectedTowerType: TowerType | null;
  onTowerTypeSelect: (type: TowerType | null) => void;
  onTowerUpgrade: (tower: Tower) => void;
  onTowerSell: (tower: Tower) => void;
  onPauseToggle: () => void;
  onBackToMenu: () => void;
  onNextWave: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  selectedTower,
  selectedTowerType,
  onTowerTypeSelect,
  onTowerUpgrade,
  onTowerSell,
  onPauseToggle,
  onBackToMenu,
  onNextWave
}) => {
  const { user } = useAuth();

  const canAffordTower = (type: TowerType): boolean => {
    const config = TOWER_CONFIGS[type];
    return gameState.gold >= config.baseCost;
  };

  const canUpgradeTower = (tower: Tower): boolean => {
    return tower.level < TOWER_CONFIGS[tower.type].maxLevel && 
           gameState.gold >= tower.upgradeCost;
  };

  const getTowerTypeEmoji = (type: TowerType): string => {
    switch (type) {
      case 'sniper': return '🎯';
      case 'shotgun': return '💥';
      case 'gasBomber': return '💣';
      case 'sword': return '⚔️';
      case 'wizard': return '🔮';
      default: return '🏰';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex justify-between items-center">
          <Card className="bg-white/90 backdrop-blur border-2 border-amber-300">
            <CardContent className="flex items-center space-x-6 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">💰 {gameState.gold}</div>
                <div className="text-sm text-amber-700">Gold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">❤️ {gameState.lives}</div>
                <div className="text-sm text-red-700">Lives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">🌊 {gameState.currentWave}</div>
                <div className="text-sm text-blue-700">Wave</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">⭐ {gameState.score}</div>
                <div className="text-sm text-purple-700">Score</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button
              onClick={onPauseToggle}
              variant="outline"
              className="bg-white/90 backdrop-blur"
            >
              {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
            <Button
              onClick={onBackToMenu}
              variant="outline"
              className="bg-white/90 backdrop-blur"
            >
              🏠 Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Left Panel - Tower Selection */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
        <Card className="bg-white/90 backdrop-blur border-2 border-green-300 w-64">
          <CardHeader>
            <CardTitle className="text-green-800">🏰 Build Towers</CardTitle>
            <CardDescription>Select a tower type to place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(TOWER_CONFIGS) as TowerType[]).map((type) => {
              const config = TOWER_CONFIGS[type];
              const isUnlocked = user?.unlockedTowers.includes(type) || false;
              const canAfford = canAffordTower(type);
              const isSelected = selectedTowerType === type;

              return (
                <Button
                  key={type}
                  onClick={() => onTowerTypeSelect(isSelected ? null : type)}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full p-3 text-left ${
                    !isUnlocked ? 'opacity-50 cursor-not-allowed' :
                    !canAfford ? 'opacity-75' : ''
                  } ${isSelected ? 'bg-green-600 text-white' : ''}`}
                  disabled={!isUnlocked}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTowerTypeEmoji(type)}</span>
                        <span className="font-semibold">{config.name}</span>
                      </div>
                      <div className="text-xs opacity-75">💰 {config.baseCost}</div>
                    </div>
                    {!canAfford && <span className="text-red-500 text-xs">Need more gold</span>}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Tower Info */}
      {selectedTower && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
          <Card className="bg-white/90 backdrop-blur border-2 border-blue-300 w-64">
            <CardHeader>
              <CardTitle className="text-blue-800">
                {getTowerTypeEmoji(selectedTower.type)} {TOWER_CONFIGS[selectedTower.type].name}
              </CardTitle>
              <CardDescription>Level {selectedTower.level} Tower</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Damage: {Math.round(selectedTower.damage)}</div>
                <div>Range: {selectedTower.range.toFixed(1)}</div>
                <div>Speed: {(1000 / selectedTower.attackSpeed).toFixed(1)}/s</div>
                <div>Value: {Math.round(selectedTower.cost * 0.7)}</div>
              </div>

              <div className="space-y-2">
                {canUpgradeTower(selectedTower) ? (
                  <Button
                    onClick={() => onTowerUpgrade(selectedTower)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    ⬆️ Upgrade (💰 {selectedTower.upgradeCost})
                  </Button>
                ) : (
                  <div className="text-center text-sm text-gray-600">
                    {selectedTower.level >= TOWER_CONFIGS[selectedTower.type].maxLevel 
                      ? 'Max Level Reached' 
                      : 'Need more gold'
                    }
                  </div>
                )}

                <Button
                  onClick={() => onTowerSell(selectedTower)}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  💸 Sell (+💰 {Math.round(selectedTower.cost * 0.7)})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Panel - Wave Control */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className="bg-white/90 backdrop-blur border-2 border-purple-300">
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-800">
                {gameState.enemies.length > 0 ? 'Wave in Progress' : 'Wave Complete'}
              </div>
              <div className="text-sm text-purple-600">
                Enemies: {gameState.enemies.length}
              </div>
            </div>
            
            {gameState.enemies.length === 0 && !gameState.gameOver && (
              <Button
                onClick={onNextWave}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                🌊 Start Wave {gameState.currentWave + 1}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-white border-4 border-red-500 w-96">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-red-800">
                {gameState.victory ? '🎉 Victory!' : '💀 Game Over'}
              </CardTitle>
              <CardDescription className="text-lg">
                {gameState.victory 
                  ? 'You successfully defended your territory!' 
                  : 'Your defenses have been overwhelmed!'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Final Score</div>
                  <div className="text-xl text-purple-600">{gameState.score}</div>
                </div>
                <div>
                  <div className="font-semibold">Waves Survived</div>
                  <div className="text-xl text-blue-600">{gameState.currentWave}</div>
                </div>
                <div>
                  <div className="font-semibold">Gold Earned</div>
                  <div className="text-xl text-amber-600">{gameState.gold}</div>
                </div>
                <div>
                  <div className="font-semibold">Towers Built</div>
                  <div className="text-xl text-green-600">{gameState.towers.length}</div>
                </div>
              </div>
              
              <Button
                onClick={onBackToMenu}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                🏠 Return to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
