import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { login, register, loading, error } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, name);
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
          {isLogin ? 'Welcome back, ready to bunk?' : 'Create your account to start tracking.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
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

          <div>
            <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Password</div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            ) : isLogin ? (
              <><LogIn size={20} strokeWidth={2.5} /> Login</>
            ) : (
              <><UserPlus size={20} strokeWidth={2.5} /> Sign Up</>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
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
        </div>
      </motion.div>
    </div>
  );
}
