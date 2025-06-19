
import { describe, it, expect, beforeEach } from 'vitest';
import { authDB } from '../database/auth';

describe('Authentication System', () => {
  beforeEach(() => {
    // Reset database for each test
    // In a real test environment, you'd want to use a test database
  });

  it('should create new user with default values', async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'testpass123';
    
    const user = await authDB.registerUser(email, password);
    
    expect(user).toBeDefined();
    expect(user?.email).toBe(email);
    expect(user?.totalGold).toBe(500);
    expect(user?.highScore).toBe(0);
    expect(user?.unlockedTowers).toContain('sniper');
    expect(user?.unlockedTowers).toContain('shotgun');
  });

  it('should not allow duplicate email registration', async () => {
    const email = `duplicate${Date.now()}@example.com`;
    const password = 'testpass123';
    
    const firstUser = await authDB.registerUser(email, password);
    expect(firstUser).toBeDefined();
    
    const secondUser = await authDB.registerUser(email, password);
    expect(secondUser).toBeNull();
  });

  it('should allow user login with valid credentials', async () => {
    const email = `login${Date.now()}@example.com`;
    const password = 'testpass123';
    
    await authDB.registerUser(email, password);
    const loginUser = await authDB.loginUser(email, password);
    
    expect(loginUser).toBeDefined();
    expect(loginUser?.email).toBe(email);
  });

  it('should update user progress correctly', async () => {
    const email = `progress${Date.now()}@example.com`;
    const password = 'testpass123';
    
    const user = await authDB.registerUser(email, password);
    expect(user).toBeDefined();
    
    const updateSuccess = await authDB.updateUserProgress(user!.id, {
      totalGold: 1000,
      highScore: 500
    });
    
    expect(updateSuccess).toBe(true);
    
    const updatedUser = authDB.getUserById(user!.id);
    expect(updatedUser?.totalGold).toBe(1000);
    expect(updatedUser?.highScore).toBe(500);
  });
});
