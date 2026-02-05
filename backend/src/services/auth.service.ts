import bcrypt from 'bcrypt';
import {query} from '../config/database.js';
import {Users} from '../models/types.js';

export class AuthService {

  async validateUser(username: string, password: string): Promise<Users | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const user: Users = {
      idUser: row.id_user,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    };
    if (!user.passwordHash) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async createUser(
    username: string,
    password: string,
    email?: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<Users> {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, password_hash, email, role)
       VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [username, passwordHash, email || null, role]
    );

    const row = result.rows[0];
    return {
      idUser: row.id_user,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    };
  }

  async getUserById(id: number): Promise<Users | null> {
    const result = await query<Users>(
      'SELECT * FROM users WHERE id_user = $1',
      [id]
    );

    return result.rows[0] || null;
  }
}
