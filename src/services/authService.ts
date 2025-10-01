import * as jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<IUser> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = new User({
      email,
      password_hash: password, // Will be hashed by pre-save hook
      name
    });

    await user.save();
    return user;
  }

  static async login(data: LoginData): Promise<{ user: IUser; tokens: AuthTokens }> {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  static generateTokens(user: IUser): AuthTokens {
    const payload = {
      userId: user._id,
      email: user.email
    };

    const access_token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    } as jwt.SignOptions);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 7 * 24 * 60 * 60 // 7 days in seconds
    };
  }

  static verifyToken(token: string): any {
    try {
      console.log('🔐 Verifying with JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ JWT verification successful');
      return decoded;
    } catch (error: any) {
      console.log('❌ JWT verification error:', error.message);
      console.log('❌ Expected secret preview:', JWT_SECRET.substring(0, 10) + '...');
      throw new Error('Invalid token');
    }
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}