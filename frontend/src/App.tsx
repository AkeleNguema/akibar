import { useState } from 'react';
import { Login } from './components/Login';
import { DebtManager } from './components/DebtManager';
import { StockManager } from './components/StockManager';
import { getStoredToken, logoutBar } from './services/authService';
import './styles/app.css';

type TabType = 'caisse' | 'stock' | 'ardoises' | 'cloture';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredToken());
  });
  const [activeTab, setActiveTab] = useState<TabType>('stock'); // 'stock' par défaut pour le tester direct

  const handleLogout = () => {
    logoutBar();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h2 className="app-title">🍺 Akibar</h2>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'caisse' ? 'active' : ''}`}
            onClick={() => setActiveTab('caisse')}
          >
            Caisse / Vente
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            Approvisionnement & Stock
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'ardoises' ? 'active' : ''}`}
            onClick={() => setActiveTab('ardoises')}
          >
            Ardoises
          </button>
        </nav>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <main className="app-main">
        {activeTab === 'ardoises' && <DebtManager />}
        {activeTab === 'stock' && <StockManager />}
        {activeTab === 'caisse' && (
          <div className="placeholder-view">
            <h3>Module Caisse à venir...</h3>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;