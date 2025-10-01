import express from 'express';
import { AuthService, RegisterData, LoginData } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data: RegisterData = req.body;

    // Basic validation
    if (!data.email || !data.password || !data.name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (data.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await AuthService.register(data);

    // Don't return password hash
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Login attempt for:', req.body.email);
    const data: LoginData = req.body;

    if (!data.email || !data.password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, tokens } = await AuthService.login(data);
    console.log('✅ Login successful for:', user.email);

    // Don't return password hash
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: message });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userResponse = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      created_at: req.user.created_at
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

export default router;