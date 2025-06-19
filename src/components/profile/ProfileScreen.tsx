
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TOWER_CONFIGS, TowerType } from '../../types/game';

interface ProfileScreenProps {
  onBackToMenu: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBackToMenu }) => {
  const { user } = useAuth();

  if (!user) return null;

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">📊 Player Profile</h1>
          <p className="text-purple-600 text-lg">{user.email}</p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Stats Overview */}
          <Card className="border-2 border-purple-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-800">🏆 Statistics</CardTitle>
              <CardDescription>Your overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="text-3xl font-bold text-amber-600">{user.totalGold}</div>
                  <div className="text-amber-700">Total Gold</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{user.highScore}</div>
                  <div className="text-purple-700">High Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">{user.unlockedTowers.length}</div>
                  <div className="text-green-700">Towers Unlocked</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-blue-700">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tower Collection */}
          <Card className="border-2 border-green-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">🏰 Tower Collection</CardTitle>
              <CardDescription>Your available towers and upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {(Object.keys(TOWER_CONFIGS) as TowerType[]).map((type) => {
                  const config = TOWER_CONFIGS[type];
                  const isUnlocked = user.unlockedTowers.includes(type);
                  const upgradeLevel = user.towerUpgrades[type] || 0;

                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-lg border-2 ${
                        isUnlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTowerTypeEmoji(type)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{config.name}</h3>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isUnlocked ? (
                            <div>
                              <div className="text-green-600 font-semibold">✅ Unlocked</div>
                              <div className="text-sm text-green-700">
                                Upgrade Level: {upgradeLevel}/{config.maxLevel}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-gray-500">🔒 Locked</div>
                              <div className="text-xs text-gray-400">Complete challenges to unlock</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {isUnlocked && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-semibold">Damage</div>
                            <div className="text-red-600">{config.baseDamage}</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-semibold">Range</div>
                            <div className="text-blue-600">{config.baseRange}</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-semibold">Cost</div>
                            <div className="text-amber-600">{config.baseCost}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-2 border-blue-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">🏅 Achievements</CardTitle>
              <CardDescription>Your accomplishments and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className={`p-3 rounded-lg border-2 ${user.highScore >= 1000 ? 'bg-gold-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{user.highScore >= 1000 ? '🏆' : '🔒'}</span>
                      <span className="font-semibold">Score Master</span>
                    </div>
                    <span className="text-sm">{user.highScore >= 1000 ? 'Achieved!' : 'Score 1000+ points'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border-2 ${user.totalGold >= 5000 ? 'bg-gold-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{user.totalGold >= 5000 ? '💰' : '🔒'}</span>
                      <span className="font-semibold">Gold Collector</span>
                    </div>
                    <span className="text-sm">{user.totalGold >= 5000 ? 'Achieved!' : 'Earn 5000+ total gold'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border-2 ${user.unlockedTowers.length >= 3 ? 'bg-gold-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{user.unlockedTowers.length >= 3 ? '🏰' : '🔒'}</span>
                      <span className="font-semibold">Tower Commander</span>
                    </div>
                    <span className="text-sm">{user.unlockedTowers.length >= 3 ? 'Achieved!' : 'Unlock 3+ tower types'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={onBackToMenu}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            🏠 Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
