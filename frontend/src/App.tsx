import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { DebtManager } from './components/DebtManager';
import { getStoredToken, logoutBar } from './services/authService';
import './styles/app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(Boolean(token));
  }, []);

  const handleLogout = () => {
    logoutBar();
    setIsAuthenticated(false);
  };

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div>
          <header className="app-header">
            <h2 className="app-logo">Akibar</h2>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </header>
          <main>
            <DebtManager />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;