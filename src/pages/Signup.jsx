import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Signup = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error: signupError } = await signup(email, password, name);

    if (signupError) {
      setError('Erro ao criar conta. Verifique os dados ou tente outro e-mail.');
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
            Faça parte da elite da nutrição esportiva.
          </p>
        </div>

        <div className="auth-card">
          <div className="card-top-content">
            <h2 className="auth-form-title">Criar nova conta</h2>
            <p className="auth-form-subtitle">
              Comece sua jornada profissional hoje mesmo.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="name">Nome Completo</label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Dr(a). Nome Sobrenome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Senha de Acesso</label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="confirmPassword">Confirme sua Senha</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Cadastrando...' : 'Criar Conta Profissional'}
            </button>
          </form>

          <footer className="auth-footer">
            <span>Já possui acesso? </span>
            <Link to="/login" className="auth-link">
              Faça login
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Signup;
