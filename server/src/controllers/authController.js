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

    // Generate 6-digit OTP verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes validity

    await run('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [
      otpCode,
      expiresAt,
      user.id
    ]);

    console.log(`[OTP VERIFICATION] Sent OTP ${otpCode} to user ${user.email}`);

    return res.json({
      requiresOtp: true,
      email: user.email,
      message: `OTP verification code sent to ${user.email}`,
      otpCode: otpCode // Returned for easy testing & demo preview
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP verification code are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (!user.otp_code || user.otp_code.trim() !== otpCode.trim()) {
      return res.status(400).json({ error: 'Invalid OTP verification code. Please check and try again.' });
    }

    const now = new Date();
    const expiryDate = new Date(user.otp_expires_at);
    if (now > expiryDate) {
      return res.status(400).json({ error: 'OTP verification code has expired. Please request a new OTP.' });
    }

    // Clear OTP after successful verification
    await run('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      message: 'Email OTP verification successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Server error during OTP verification.' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await run('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [
      otpCode,
      expiresAt,
      user.id
    ]);

    console.log(`[OTP VERIFICATION] Resent OTP ${otpCode} to user ${user.email}`);

    return res.json({
      message: `New OTP verification code sent to ${user.email}`,
      otpCode: otpCode
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP.' });
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
