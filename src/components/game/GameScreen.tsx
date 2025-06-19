
import React, { useState } from 'react';
import { Game3D } from './Game3D';
import { GameUI } from './GameUI';
import { useGameEngine } from '../../hooks/useGameEngine';
import { Tower, TowerType } from '../../types/game';
import * as THREE from 'three';

interface GameScreenProps {
  onBackToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu }) => {
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);

  const {
    gameState,
    placeTower,
    upgradeTower,
    sellTower,
    startWave,
    pauseGame,
    resetGame
  } = useGameEngine();

  const handleTowerPlace = (position: THREE.Vector3, type: TowerType) => {
    const success = placeTower(position, type);
    if (success) {
      setSelectedTowerType(null);
    }
  };

  const handleTowerSelect = (tower: Tower | null) => {
    setSelectedTower(tower);
    setSelectedTowerType(null);
  };

  const handleTowerTypeSelect = (type: TowerType | null) => {
    setSelectedTowerType(type);
    setSelectedTower(null);
  };

  const handleTowerUpgrade = (tower: Tower) => {
    upgradeTower(tower);
    // Update selected tower with new stats
    const updatedTower = gameState.towers.find(t => t.id === tower.id);
    if (updatedTower) {
      setSelectedTower(updatedTower);
    }
  };

  const handleTowerSell = (tower: Tower) => {
    sellTower(tower);
    setSelectedTower(null);
  };

  const handleBackToMenu = () => {
    resetGame();
    onBackToMenu();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-100 to-green-200 relative">
      <Game3D
        gameState={gameState}
        onTowerPlace={handleTowerPlace}
        onTowerSelect={handleTowerSelect}
        selectedTower={selectedTower}
        selectedTowerType={selectedTowerType}
      />
      
      <GameUI
        gameState={gameState}
        selectedTower={selectedTower}
        selectedTowerType={selectedTowerType}
        onTowerTypeSelect={handleTowerTypeSelect}
        onTowerUpgrade={handleTowerUpgrade}
        onTowerSell={handleTowerSell}
        onPauseToggle={pauseGame}
        onBackToMenu={handleBackToMenu}
        onNextWave={startWave}
      />
    </div>
  );
};
