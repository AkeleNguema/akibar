import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { DebtManager } from './components/DebtManager';
import { StockManager } from './components/StockManager';
import { CashRegister } from './components/CashRegister';
import { ExpenseManager } from './components/ExpenseManager';
import { ClosureDashboard } from './components/ClosureDashboard';
import { Dashboard } from './components/Dashboard';
import { getStoredToken, logoutBar } from './services/authService';
import { initSyncListeners, isOnline } from './services/syncService';
import './styles/app.css';

type TabType = 'dashboard' | 'caisse' | 'stock' | 'ardoises' | 'depenses' | 'cloture';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredToken());
  });
  const [activeTab, setActiveTab] = useState<TabType>('caisse');
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline());

  useEffect(() => {
    const cleanup = initSyncListeners((status) => {
      setOnlineStatus(status);
    });
    return cleanup;
  }, []);

  const handleLogout = () => {
    logoutBar();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      {!onlineStatus && (
        <div style={{ background: '#ef4444', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
          ⚠️ Mode Hors Ligne - Les ventes sont sauvegardées localement et seront synchronisées au retour du réseau.
        </div>
      )}
      <header className="app-header">
        <h2 className="app-title">🍺 Akibar</h2>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
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
          <button
            type="button"
            className={`nav-btn ${activeTab === 'depenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('depenses')}
          >
            Dépenses
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'cloture' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloture')}
          >
            Clôture
          </button>
        </nav>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'caisse' && <CashRegister />}
        {activeTab === 'stock' && <StockManager />}
        {activeTab === 'ardoises' && <DebtManager />}
        {activeTab === 'depenses' && <ExpenseManager />}
        {activeTab === 'cloture' && <ClosureDashboard />}
      </main>
    </div>
  );
}

export default App;