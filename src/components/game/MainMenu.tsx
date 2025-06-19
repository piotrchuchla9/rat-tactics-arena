
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface MainMenuProps {
  onStartGame: () => void;
  onShowProfile: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowProfile }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-green-800 mb-4">🐭 Rat Defense</h1>
          <p className="text-2xl text-green-600 mb-2">3D Tower Defense Adventure</p>
          <p className="text-lg text-green-700">
            Welcome back, <span className="font-semibold">{user?.email}</span>!
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="border-2 border-green-300 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-800">🎮 Play Game</CardTitle>
              <CardDescription className="text-lg">
                Defend your territory with brave rat warriors!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={onStartGame}
                className="text-xl px-8 py-4 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Start Battle
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-300 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-blue-800">📊 Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-blue-700">High Score: <span className="font-bold">{user?.highScore}</span></p>
                <p className="text-blue-700">Total Gold: <span className="font-bold">{user?.totalGold}</span></p>
                <Button
                  onClick={onShowProfile}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-300 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-red-800">⚙️ Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-300">
          <h3 className="text-xl font-bold text-amber-800 mb-3">🏰 Tower Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-2">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-sm font-semibold text-amber-700">Sniper Rat</p>
            </div>
            <div className="p-2">
              <div className="text-2xl mb-1">💥</div>
              <p className="text-sm font-semibold text-amber-700">Shotgun Rat</p>
            </div>
            <div className="p-2">
              <div className="text-2xl mb-1">💣</div>
              <p className="text-sm font-semibold text-amber-700">Gas Bomber</p>
            </div>
            <div className="p-2">
              <div className="text-2xl mb-1">⚔️</div>
              <p className="text-sm font-semibold text-amber-700">Sword Rat</p>
            </div>
            <div className="p-2">
              <div className="text-2xl mb-1">🔮</div>
              <p className="text-sm font-semibold text-amber-700">Wizard Rat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
