import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { Login } from './components/Login';
import { DebtManager } from './components/DebtManager';
import { StockManager } from './components/StockManager';
import { CashRegister } from './components/CashRegister';
import { ExpenseManager } from './components/ExpenseManager';
import { ClosureDashboard } from './components/ClosureDashboard';
import { Dashboard } from './components/Dashboard';
import { FinancialReport } from './components/FinancialReport';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import CookieConsent from 'react-cookie-consent';
import { logoutBar, getMe } from './services/authService';
import { initSyncListeners, isOnline } from './services/syncService';
import { OwnerDashboard } from './components/OwnerDashboard';
import './styles/app.css';

const Layout = ({ userRole, handleLogout, quitAssistance, assistanceBarId, onlineStatus }: any) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

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
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Akibar" className="w-10 h-10 object-contain rounded-lg" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
        </div>

        <nav className="app-nav" style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <Link to="/caisse" className={`nav-btn ${location.pathname === '/caisse' ? 'active' : ''}`}>Caisse / Vente</Link>
          
          {userRole !== 'SERVEUR' && (
            <>
              {userRole === 'PROPRIETAIRE' ? (
                <Link to="/owner-dashboard" className={`nav-btn ${location.pathname === '/owner-dashboard' ? 'active' : ''}`}>Mon Dashboard</Link>
              ) : (
                <Link to="/dashboard" className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              )}
              {(userRole === 'ADMIN' || userRole === 'GERANT' || userRole === 'PROPRIETAIRE' || userRole === 'SUPER_ADMIN') && (
                <Link to="/rapports" className={`nav-btn ${location.pathname === '/rapports' ? 'active' : ''}`}>Rapports Financiers</Link>
              )}
              <Link to="/stock" className={`nav-btn ${location.pathname === '/stock' ? 'active' : ''}`}>Approvisionnement & Stock</Link>
              <Link to="/ardoises" className={`nav-btn ${location.pathname === '/ardoises' ? 'active' : ''}`}>Ardoises</Link>
              <Link to="/depenses" className={`nav-btn ${location.pathname === '/depenses' ? 'active' : ''}`}>Dépenses</Link>
              <Link to="/cloture" className={`nav-btn btn-closure ${location.pathname === '/cloture' ? 'active' : ''}`}>Clôture</Link>
            </>
          )}
          <button type="button" className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>Déconnexion</button>
        </nav>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
          <h2 className="app-title" style={{ margin: 0, whiteSpace: 'nowrap' }}>
            {userRole === 'PROPRIETAIRE' && <span style={{fontSize: '0.8rem', color: '#f59e0b', marginLeft: '10px'}}>(PROPRIÉTAIRE)</span>}
          </h2>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmer la déconnexion</h3>
            <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Annuler</button>
              <button className="btn-danger" onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}>Se déconnecter</button>
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline());
  const [assistanceBarId, setAssistanceBarId] = useState<string | null>(localStorage.getItem('assistanceBarId'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cleanup = initSyncListeners((status) => {
      setOnlineStatus(status);
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      const me = await getMe();
      if (me) {
        setIsAuthenticated(true);
        setUserRole(me.role);
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate(me.role === 'PROPRIETAIRE' ? '/owner-dashboard' : '/caisse', { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    };
    verifyAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutBar();
    localStorage.removeItem('assistanceBarId');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  const quitAssistance = () => {
    localStorage.removeItem('assistanceBarId');
    setAssistanceBarId(null);
    window.location.reload();
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Chargement...</div>;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/login')} />} />
        <Route path="/terms" element={<TermsOfService onBack={() => navigate('/login')} />} />
        <Route path="/login" element={
          <div>
            <Login 
              onBack={() => navigate('/')}
              onLoginSuccess={async () => {
                const me = await getMe();
                if (me) {
                  setIsAuthenticated(true);
                  setUserRole(me.role);
                  navigate(me.role === 'PROPRIETAIRE' ? '/owner-dashboard' : '/caisse', { replace: true });
                }
              }} 
            />
            <div style={{ textAlign: 'center', padding: '1rem', marginTop: '2rem' }}>
              <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer', marginRight: '1rem' }}>Politique de Confidentialité</button>
              <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }}>Conditions d'Utilisation</button>
            </div>
          </div>
        } />
        <Route path="/" element={
          <HomePage 
            onNavigateToLogin={() => navigate('/login')} 
            onNavigateToPrivacy={() => navigate('/privacy')} 
            onNavigateToTerms={() => navigate('/terms')} 
          />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (userRole === 'SUPER_ADMIN' && !assistanceBarId) {
    return (
      <div className="app-container">
        <main className="app-main" style={{ padding: 0 }}>
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
    <Routes>
      <Route element={<Layout userRole={userRole} handleLogout={handleLogout} quitAssistance={quitAssistance} assistanceBarId={assistanceBarId} onlineStatus={onlineStatus} />}>
        <Route path="/caisse" element={<CashRegister />} />
        <Route path="/dashboard" element={<Dashboard onNavigate={(path) => navigate(`/${path}`)} />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/rapports" element={<FinancialReport />} />
        <Route path="/stock" element={<StockManager />} />
        <Route path="/ardoises" element={<DebtManager />} />
        <Route path="/depenses" element={<ExpenseManager />} />
        <Route path="/cloture" element={<ClosureDashboard />} />
        <Route path="*" element={<Navigate to="/caisse" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper />
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
    </BrowserRouter>
  );
}

export default App;