import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run } from '../db/database.js';
import { JWT_SECRET } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const userId = result.id;

    // Create default subjects for new user
    const defaultSubjects = ['Mathematics', 'Computer Science', 'Data Structures', 'Database Systems'];
    for (const subj of defaultSubjects) {
      const sRes = await run('INSERT INTO subjects (user_id, name) VALUES (?, ?)', [userId, subj]);
      await run('INSERT INTO attendance (user_id, subject_id, attended, total) VALUES (?, ?, ?, ?)', [
        userId,
        sRes.id,
        15,
        18
      ]);
    }

    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim() }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim() }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};
