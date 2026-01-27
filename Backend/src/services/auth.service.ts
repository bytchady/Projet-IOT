import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { User } from '../models/types.js';

export class AuthService {
  async validateUser(username: string, password: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM utilisateur WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async createUser(username: string, password: string, email?: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query<User>(
      `INSERT INTO utilisateur (username, password_hash, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, passwordHash, email || null, role]
    );

    return result.rows[0];
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM utilisateur WHERE id_user = $1',
      [id]
    );

    return result.rows[0] || null;
  }
}
