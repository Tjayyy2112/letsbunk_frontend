import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register, forgotPassword, loading, error } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    useStore.setState({ error: null });
    if (isForgot) {
      if (newPassword !== confirmPassword) {
        useStore.setState({ error: "New passwords do not match" });
        return;
      }
      try {
        await forgotPassword(email, recoveryKey, newPassword);
        alert("Password reset successful! You can now log in.");
        setIsForgot(false);
        setIsLogin(true);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setRecoveryKey('');
      } catch (err) {
        // Handled in store
      }
    } else if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, name, recoveryKey);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -150,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(142,216,204,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--card)',
          borderRadius: 32,
          padding: 32,
          border: '1px solid var(--border)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(142,216,204,0.1)'
          }}>
            <BookOpen size={36} color="var(--accent)" />
          </div>
        </div>
        
        <h1 style={{
          fontSize: 28, fontWeight: 800, textAlign: 'center',
          color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.5px'
        }}>
          Let'sBunk
        </h1>
        <p style={{
          textAlign: 'center', color: 'var(--text-secondary)',
          fontSize: 14, marginBottom: 32, fontWeight: 500
        }}>
          {isForgot 
            ? 'Reset your password using your recovery key.' 
            : isLogin 
              ? 'Welcome back, ready to bunk?' 
              : 'Create your account to start tracking.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="popLayout">
            {!isLogin && !isForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Name</div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '14px 16px', color: 'var(--text-primary)',
                    fontSize: 15, outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '14px 16px', color: 'var(--text-primary)',
                fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {!isForgot && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Password</span>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setIsLogin(false); useStore.setState({ error: null }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '14px 44px 14px 16px', color: 'var(--text-primary)',
                    fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Recovery Key input field (shown on Sign Up or Forgot Password) */}
          {(isForgot || (!isLogin && !isForgot)) && (
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {isForgot ? 'Secret Recovery Key' : 'Create Secret Recovery Key'}
              </div>
              <input
                type="text"
                required
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="e.g. MySecretWord123"
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '14px 16px', color: 'var(--text-primary)',
                  fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              {!isForgot && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                  This key is required to reset your password if you ever forget it. Keep it safe!
                </div>
              )}
            </div>
          )}

          {/* New Password & Confirm Password for Forgot Password view */}
          {isForgot && (
            <>
              <div>
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>New Password</div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '14px 16px', color: 'var(--text-primary)',
                    fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Confirm New Password</div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '14px 16px', color: 'var(--text-primary)',
                    fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  padding: 12, background: 'var(--danger-dim)', border: '1px solid rgba(216,92,99,0.2)',
                  color: 'var(--danger)', borderRadius: 14, fontSize: 13, fontWeight: 600, textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: 'var(--accent)', color: '#07110F',
              fontWeight: 800, borderRadius: 16, padding: '16px', fontSize: 16,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginTop: 8, opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: '2px solid rgba(7,17,15,0.2)', borderTop: '2px solid #07110F'
                }}
              />
            ) : isForgot ? (
              'Reset Password'
            ) : isLogin ? (
              <><LogIn size={20} strokeWidth={2.5} /> Login</>
            ) : (
              <><UserPlus size={20} strokeWidth={2.5} /> Sign Up</>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {isForgot ? (
            <button
              type="button"
              onClick={() => { setIsForgot(false); setIsLogin(true); useStore.setState({ error: null }); }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--accent)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 16px',
                borderRadius: 12
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--accent-dim)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Back to Login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); useStore.setState({ error: null }); }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--accent)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 16px',
                borderRadius: 12
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--accent-dim)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
