
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';
import { Tower, Enemy, GameState, TowerType, TOWER_CONFIGS } from '../../types/game';
import { useAuth } from '../../contexts/AuthContext';

interface TowerMeshProps {
  tower: Tower;
  onClick: () => void;
  isSelected: boolean;
}

const TowerMesh: React.FC<TowerMeshProps> = ({ tower, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Group>(null);

  const getTowerColor = (type: TowerType): string => {
    switch (type) {
      case 'sniper': return '#8B4513';
      case 'shotgun': return '#2F4F4F';
      case 'gasBomber': return '#6B8E23';
      case 'sword': return '#B22222';
      case 'wizard': return '#4B0082';
      default: return '#808080';
    }
  };

  const getTowerEmoji = (type: TowerType): string => {
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
    <group
      ref={meshRef}
      position={[tower.position.x, tower.position.y, tower.position.z]}
      onClick={onClick}
    >
      {/* Tower Base */}
      <Box
        args={[1, 0.5, 1]}
        position={[0, 0.25, 0]}
        material-color={getTowerColor(tower.type)}
      />
      
      {/* Tower Top */}
      <Cone
        args={[0.8, 1, 8]}
        position={[0, 1, 0]}
        material-color={getTowerColor(tower.type)}
      />

      {/* Range Indicator when selected */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tower.range - 0.1, tower.range, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Tower Level Indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {getTowerEmoji(tower.type)} Lv.{tower.level}
      </Text>
    </group>
  );
};

interface EnemyMeshProps {
  enemy: Enemy;
}

const EnemyMesh: React.FC<EnemyMeshProps> = ({ enemy }) => {
  const meshRef = useRef<THREE.Group>(null);

  const getEnemyColor = (type: Enemy['type']): string => {
    switch (type) {
      case 'basic': return '#ff6b6b';
      case 'fast': return '#4ecdc4';
      case 'heavy': return '#45b7d1';
      case 'boss': return '#9c44dc';
      default: return '#ff6b6b';
    }
  };

  const getEnemySize = (type: Enemy['type']): number => {
    switch (type) {
      case 'basic': return 0.4;
      case 'fast': return 0.3;
      case 'heavy': return 0.6;
      case 'boss': return 0.8;
      default: return 0.4;
    }
  };

  return (
    <group
      ref={meshRef}
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
    >
      <Sphere 
        args={[getEnemySize(enemy.type)]}
        material-color={getEnemyColor(enemy.type)}
      />
      
      {/* Health Bar */}
      <group position={[0, 1, 0]}>
        <Box 
          args={[0.8, 0.1, 0.1]} 
          position={[0, 0, 0]}
          material-color="#333333"
        />
        <Box
          args={[(enemy.health / enemy.maxHealth) * 0.8, 0.08, 0.08]}
          position={[(-0.8 + (enemy.health / enemy.maxHealth) * 0.8) / 2, 0, 0.01]}
          material-color="#ff0000"
        />
      </group>
    </group>
  );
};

const GamePath: React.FC = () => {
  const pathPoints = [
    new THREE.Vector3(-8, 0, 0),
    new THREE.Vector3(-4, 0, 0),
    new THREE.Vector3(-4, 0, 4),
    new THREE.Vector3(0, 0, 4),
    new THREE.Vector3(0, 0, -4),
    new THREE.Vector3(4, 0, -4),
    new THREE.Vector3(4, 0, 0),
    new THREE.Vector3(8, 0, 0),
  ];

  return (
    <group>
      {pathPoints.map((point, index) => (
        <Box
          key={index}
          args={[0.8, 0.1, 0.8]}
          position={[point.x, point.y, point.z]}
          material-color="#8B4513"
        />
      ))}
    </group>
  );
};

interface TowerSlotProps {
  position: THREE.Vector3;
  isOccupied: boolean;
  onClick: () => void;
}

const TowerSlot: React.FC<TowerSlotProps> = ({ position, isOccupied, onClick }) => {
  return (
    <Box
      args={[1, 0.1, 1]}
      position={[position.x, position.y, position.z]}
      onClick={onClick}
    >
      <meshStandardMaterial 
        color={isOccupied ? "#654321" : "#90EE90"} 
        transparent 
        opacity={isOccupied ? 0.3 : 0.7} 
      />
    </Box>
  );
};

interface Game3DProps {
  gameState: GameState;
  onTowerPlace: (position: THREE.Vector3, type: TowerType) => void;
  onTowerSelect: (tower: Tower | null) => void;
  selectedTower: Tower | null;
  selectedTowerType: TowerType | null;
}

export const Game3D: React.FC<Game3DProps> = ({
  gameState,
  onTowerPlace,
  onTowerSelect,
  selectedTower,
  selectedTowerType
}) => {
  const towerSlots = [
    new THREE.Vector3(-6, 0, 2),
    new THREE.Vector3(-6, 0, -2),
    new THREE.Vector3(-2, 0, 2),
    new THREE.Vector3(-2, 0, -2),
    new THREE.Vector3(2, 0, 2),
    new THREE.Vector3(2, 0, -2),
    new THREE.Vector3(6, 0, 2),
    new THREE.Vector3(6, 0, -2),
  ];

  const isTowerSlotOccupied = (position: THREE.Vector3): boolean => {
    return gameState.towers.some(tower => 
      Math.abs(tower.position.x - position.x) < 0.5 &&
      Math.abs(tower.position.z - position.z) < 0.5
    );
  };

  const handleSlotClick = (position: THREE.Vector3) => {
    if (!isTowerSlotOccupied(position) && selectedTowerType) {
      onTowerPlace(position, selectedTowerType);
    }
  };

  return (
    <Canvas
      camera={{ position: [10, 15, 10], fov: 60 }}
      shadows
      className="w-full h-full"
    >
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={25}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground */}
      <Box 
        args={[20, 0.1, 20]} 
        position={[0, -0.05, 0]} 
        receiveShadow
        material-color="#228B22"
      />

      {/* Game Path */}
      <GamePath />

      {/* Tower Slots */}
      {towerSlots.map((position, index) => (
        <TowerSlot
          key={index}
          position={position}
          isOccupied={isTowerSlotOccupied(position)}
          onClick={() => handleSlotClick(position)}
        />
      ))}

      {/* Towers */}
      {gameState.towers.map((tower) => (
        <TowerMesh
          key={tower.id}
          tower={tower}
          onClick={() => onTowerSelect(tower)}
          isSelected={selectedTower?.id === tower.id}
        />
      ))}

      {/* Enemies */}
      {gameState.enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </Canvas>
  );
};
