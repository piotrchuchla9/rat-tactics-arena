
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AuthScreen } from '../components/auth/AuthScreen';
import { MainMenu } from '../components/game/MainMenu';
import { GameScreen } from '../components/game/GameScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';

type Screen = 'menu' | 'game' | 'profile';

const GameApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  switch (currentScreen) {
    case 'game':
      return <GameScreen onBackToMenu={() => setCurrentScreen('menu')} />;
    case 'profile':
      return <ProfileScreen onBackToMenu={() => setCurrentScreen('menu')} />;
    default:
      return (
        <MainMenu
          onStartGame={() => setCurrentScreen('game')}
          onShowProfile={() => setCurrentScreen('profile')}
        />
      );
  }
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <GameApp />
    </AuthProvider>
  );
};

export default Index;
