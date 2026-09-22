import React, { useState } from 'react';
import { loginBar, loginSuperAdmin } from '../services/authService';

interface LoginProps {
  onLoginSuccess: (role?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [codeBar, setCodeBar] = useState('');
  const [pin, setPin] = useState('');
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isAdminMode) {
        await loginSuperAdmin({ username: adminUser, password: adminPass });
        onLoginSuccess('SUPER_ADMIN');
      } else {
        await loginBar({ codeBar, pin });
        onLoginSuccess('BAR'); // It could be GERANT or PROPRIETAIRE internally
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Identifiants invalides ou serveur inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212', flexDirection: 'column' }}>
      <div style={{ background: '#1e232d', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        <h2 style={{ textAlign: 'center', color: '#f59e0b', marginBottom: '1.5rem' }}>
          {isAdminMode ? 'Administration Globale ⚙️' : 'Bienvenue sur AKIBAR 🍺'}
        </h2>

        {errorMsg && (
          <div style={{ background: '#ef4444', color: '#fff', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {!isAdminMode ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Identifiant Établissement (ex: REG45bar)
                </label>
                <input
                  type="text"
                  placeholder="REG45bar"
                  value={codeBar}
                  onChange={(e) => setCodeBar(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Code PIN (4 chiffres)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Utilisateur Admin
                </label>
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', textAlign: 'center' }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', border: 'none', background: '#f59e0b', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Connexion en cours...' : 'Accéder'}
          </button>
        </form>
      </div>

      <button 
        onClick={() => { setIsAdminMode(!isAdminMode); setErrorMsg(null); }} 
        style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
      >
        {isAdminMode ? 'Retour à la connexion Bar' : 'Accès Super Admin'}
      </button>
    </div>
  );
};