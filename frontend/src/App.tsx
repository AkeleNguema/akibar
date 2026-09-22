import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { Login } from './components/Login';
import { DebtManager } from './components/DebtManager';
import { StockManager } from './components/StockManager';
import { CashRegister } from './components/CashRegister';
import { ExpenseManager } from './components/ExpenseManager';
import { ClosureDashboard } from './components/ClosureDashboard';
import { Dashboard } from './components/Dashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import CookieConsent from 'react-cookie-consent';
import { getStoredToken, logoutBar, getUserRole } from './services/authService';
import { initSyncListeners, isOnline } from './services/syncService';
import './styles/app.css';
type TabType = 'dashboard' | 'caisse' | 'stock' | 'ardoises' | 'depenses' | 'cloture';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredToken());
  });
  const [userRole, setUserRole] = useState<string | null>(() => getUserRole());
  const [activeTab, setActiveTab] = useState<TabType>('caisse');
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline());
  const [publicPage, setPublicPage] = useState<'home' | 'login' | 'privacy' | 'terms'>('home');

  useEffect(() => {
    const cleanup = initSyncListeners((status) => {
      setOnlineStatus(status);
    });
    return cleanup;
  }, []);

  const [assistanceBarId, setAssistanceBarId] = useState<string | null>(localStorage.getItem('assistanceBarId'));

  const handleLogout = () => {
    logoutBar();
    localStorage.removeItem('assistanceBarId');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const quitAssistance = () => {
    localStorage.removeItem('assistanceBarId');
    setAssistanceBarId(null);
    // Reloading to clear any cached states/queries from the bar
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <>
        {publicPage === 'privacy' && <PrivacyPolicy onBack={() => setPublicPage('login')} />}
        {publicPage === 'terms' && <TermsOfService onBack={() => setPublicPage('login')} />}
        {publicPage === 'home' && (
          <HomePage 
            onNavigateToLogin={() => setPublicPage('login')} 
            onNavigateToPrivacy={() => setPublicPage('privacy')} 
            onNavigateToTerms={() => setPublicPage('terms')} 
          />
        )}
        {publicPage === 'login' && (
          <div>
            <Login onLoginSuccess={(role) => {
              setIsAuthenticated(true);
              if (role) setUserRole(role);
              else setUserRole(getUserRole());
            }} />
            <div style={{ textAlign: 'center', padding: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setPublicPage('privacy')} style={{ background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer', marginRight: '1rem' }}>Politique de Confidentialité</button>
              <button onClick={() => setPublicPage('terms')} style={{ background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }}>Conditions d'Utilisation</button>
            </div>
          </div>
        )}
        <CookieConsent
          location="bottom"
          buttonText="J'accepte"
          declineButtonText="Je refuse"
          enableDeclineButton
          cookieName="akibarCookieConsent"
          style={{ background: "#1f2937" }}
          buttonStyle={{ color: "#ffffff", background: "#4f46e5", borderRadius: "4px", fontSize: "14px", fontWeight: "bold" }}
          declineButtonStyle={{ color: "#ffffff", background: "#ef4444", borderRadius: "4px", fontSize: "14px" }}
        >
          Ce site utilise des cookies essentiels au fonctionnement de l'application et à la sécurité de votre session.
        </CookieConsent>
      </>
    );
  }

  if (userRole === 'SUPER_ADMIN' && !assistanceBarId) {
    return (
      <div className="app-container">
        <main className="app-main" style={{ padding: 0 }}>
          {/* We will build the new header inside SuperAdminDashboard */}
          <SuperAdminDashboard onLogout={handleLogout} onEnterAssistance={(id) => {
            localStorage.setItem('assistanceBarId', id);
            setAssistanceBarId(id);
            window.location.reload();
          }} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {userRole === 'SUPER_ADMIN' && assistanceBarId && (
        <div style={{ background: '#ef4444', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          ⚠️ Mode Assistance — ID Bar : {assistanceBarId}
          <button onClick={quitAssistance} style={{ padding: '5px 15px', background: '#fff', color: '#ef4444', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Quitter le mode assistance</button>
        </div>
      )}
      {!onlineStatus && (
        <div style={{ background: '#ef4444', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
          ⚠️ Mode Hors Ligne - Les ventes sont sauvegardées localement et seront synchronisées au retour du réseau.
        </div>
      )}
      <header className="app-header">
        <h2 className="app-title">🍺 Akibar {userRole === 'PROPRIETAIRE' && <span style={{fontSize: '0.8rem', color: '#f59e0b', marginLeft: '10px'}}>(PROPRIÉTAIRE)</span>}</h2>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'caisse' ? 'active' : ''}`}
            onClick={() => setActiveTab('caisse')}
          >
            Caisse / Vente
          </button>
          
          {userRole !== 'SERVEUR' && (
            <>
              <button
                type="button"
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
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
            </>
          )}
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