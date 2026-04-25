import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Sun, Moon, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError('Erro ao enviar e-mail de recuperação. Verifique o endereço digitado.');
      setLoading(false);
    } else {
      setMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      setLoading(false);
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
            Recupere seu acesso com segurança.
          </p>
        </div>

        <div className="auth-card">
          <div className="card-top-content">
            <h2 className="auth-form-title">Recuperar senha</h2>
            <p className="auth-form-subtitle">
              Digite seu e-mail para receber as instruções de redefinição.
            </p>
          </div>

          {!message ? (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">E-mail Cadastrado</label>
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
                {loading ? 'Processando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="success-icon-container">
                <CheckCircle size={56} />
              </div>
              <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)', marginBottom: '2rem', lineHeight: '1.5' }}>
                {message}
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
                Voltar para o Login
              </Link>
            </div>
          )}

          {!message && (
            <footer className="auth-footer">
              <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} />
                <span>Voltar para o Login</span>
              </Link>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
