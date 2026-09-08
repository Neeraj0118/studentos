import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const { login, verifyOtp, resendOtp, register } = useAuth();
  
  // Steps: 'credentials' or 'otp'
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.requiresOtp) {
        setStep('otp');
        setInfoMessage(`Verification OTP code has been sent to your email (${email}). Please check your inbox.`);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      await verifyOtp(email, otpCode);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      await resendOtp(email);
      setInfoMessage(`A new OTP verification code has been sent to ${email}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const demoEmail = 'demo@studentos.com';
      const demoPass = 'password123';
      try {
        const res = await login(demoEmail, demoPass);
        setEmail(demoEmail);
        if (res.requiresOtp) {
          setStep('otp');
          setInfoMessage(`OTP verification code sent to ${demoEmail}`);
        }
      } catch (err) {
        await register('Demo Student', demoEmail, demoPass);
        setEmail(demoEmail);
        const res = await login(demoEmail, demoPass);
        if (res.requiresOtp) {
          setStep('otp');
          setInfoMessage(`OTP verification code sent to ${demoEmail}`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div className="glass-card glass-card-glow" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        
        {/* Step 1 Header: Login Credentials */}
        {step === 'credentials' ? (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '1rem'
            }}>
              <GraduationCap color="#fff" size={30} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome to Student<span className="gradient-text">OS</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              AI-Powered Academic & Placement Platform
            </p>
          </div>
        ) : (
          /* Step 2 Header: 2FA Email OTP Verification */
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
              marginBottom: '1rem'
            }}>
              <ShieldCheck color="#fff" size={30} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Check Your Email</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Enter the 6-digit OTP code sent to <strong style={{ color: '#fff' }}>{email}</strong>
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Info Message Banner */}
        {infoMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={18} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1 FORM: Email & Password */}
        {step === 'credentials' ? (
          <>
            <form onSubmit={handleCredentialsSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {loading ? 'Verifying Password...' : 'Continue to Email OTP'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
              <hr style={{ borderColor: 'var(--border-glass)' }} />
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#111827',
                padding: '0 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>OR</span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              ⚡ Quick Demo Sign In
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register Now
              </button>
            </div>
          </>
        ) : (
          /* STEP 2 FORM: 6-Digit Email OTP Input */
          <>
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit Verification Code *</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    style={{ paddingLeft: '2.75rem', letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 700 }}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || otpCode.length < 6}
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {loading ? 'Verifying OTP...' : 'Verify & Enter Dashboard'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtpCode(''); setError(''); setInfoMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={14} /> Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RefreshCw size={13} /> Resend OTP
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
