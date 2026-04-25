import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <button 
        onClick={toggleTheme}
        style={{ position: 'fixed', top: '2rem', right: '2rem', padding: '0.75rem', borderRadius: '50%', border: '1px solid var(--border-light)', backgroundColor: 'var(--white)', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
        aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="auth-card-wrapper animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon-bg">
              <Zap size={28} fill="currentColor" />
            </div>
            <h1 className="logo-text">
              Nutri<span className="logo-brand">Run</span>
            </h1>
          </div>
          <p className="auth-tagline">
            Sua plataforma inteligente de nutrição esportiva.
          </p>
        </div>

        <div className="auth-card">
          <div className="card-top-content">
            <h2 className="auth-form-title">Acesse sua conta</h2>
            <p className="auth-form-subtitle">
              Entre para gerenciar seus atletas e pacientes.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Endereço de E-mail</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="exemplo@nutrirun.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label className="input-label" htmlFor="password">Senha</label>
                <Link to="/forgot-password" title="Esqueceu a senha?" className="auth-link" style={{ fontSize: '0.8rem' }}>
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Autenticando...' : 'Acessar Plataforma'}
            </button>
          </form>

          <footer className="auth-footer">
            <span>Ainda não possui conta? </span>
            <Link to="/signup" className="auth-link">
              Cadastre-se grátis
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
