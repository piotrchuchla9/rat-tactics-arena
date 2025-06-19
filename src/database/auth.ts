
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { User } from '../types/game';

const DB_PATH = path.join(process.cwd(), 'gamedata.json');

interface DatabaseData {
  users: User[];
  nextUserId: number;
}

class AuthDatabase {
  private data: DatabaseData;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { users: [], nextUserId: 1 };
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { users: [], nextUserId: 1 };
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async registerUser(email: string, password: string): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUser = this.data.users.find(user => user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: this.data.nextUserId.toString(),
        email,
        totalGold: 500, // Starting gold
        highScore: 0,
        unlockedTowers: ['sniper', 'shotgun'], // Starting towers
        towerUpgrades: {
          sniper: 1,
          shotgun: 1,
          gasBomber: 0,
          sword: 0,
          wizard: 0
        },
        createdAt: new Date()
      };

      this.data.users.push(newUser);
      this.data.nextUserId++;
      this.saveData();

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    try {
      const user = this.data.users.find(user => user.email === email);
      if (!user) {
        return null;
      }

      // For demo purposes, we'll skip password verification for now
      // In a real app, you would verify the hashed password
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async updateUserProgress(userId: string, progress: Partial<User>): Promise<boolean> {
    try {
      const userIndex = this.data.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return false;
      }

      this.data.users[userIndex] = { ...this.data.users[userIndex], ...progress };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Update progress error:', error);
      return false;
    }
  }

  getUserById(userId: string): User | null {
    return this.data.users.find(user => user.id === userId) || null;
  }
}

export const authDB = new AuthDatabase();
