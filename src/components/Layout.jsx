import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Zap } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="auth-logo" style={{ marginBottom: 0 }}>
          <div className="logo-icon-bg" style={{ padding: '0.4rem' }}>
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="logo-text" style={{ fontSize: '1.2rem' }}>
            Nutri<span className="logo-brand">Run</span>
          </span>
        </div>
        <button 
          onClick={toggleSidebar} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content animate-slide-up">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
