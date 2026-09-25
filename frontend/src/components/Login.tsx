import React, { useState } from 'react';
import { loginBar, loginSuperAdmin } from '../services/authService';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role?: string) => void;
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [codeBar, setCodeBar] = useState('');
  const [pin, setPin] = useState('');
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);

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
        onLoginSuccess('BAR'); // GERANT ou PROPRIETAIRE
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Identifiants invalides ou serveur inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      
      {onBack && (
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '1rem' }}>
          <button 
            onClick={onBack}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, padding: 0 }}
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </button>
        </div>
      )}

      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '420px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div className="flex items-center justify-center gap-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Akibar" className="w-10 h-10 object-contain rounded-lg" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
          <h2 style={{ margin: 0, color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
            {isAdminMode ? 'Administration' : 'Connexion'}
          </h2>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.875rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {!isAdminMode ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>
                  Identifiant Établissement
                </label>
                <input
                  type="text"
                  placeholder="ex: REG45bar"
                  value={codeBar}
                  onChange={(e) => setCodeBar(e.target.value)}
                  required
                  style={{ boxSizing: 'border-box', width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>
                  Code PIN
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={4}
                    minLength={4}
                    pattern="\d{4}"
                    title="4 chiffres requis"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    style={{ boxSizing: 'border-box', width: '100%', padding: '0.875rem 3rem 0.875rem 1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '1.25rem', letterSpacing: showPassword ? 'normal' : '0.25em', outline: 'none', transition: 'border-color 0.2s' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>
                  Utilisateur
                </label>
                <input
                  type="text"
                  placeholder="Admin username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  required
                  style={{ boxSizing: 'border-box', width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    required
                    style={{ boxSizing: 'border-box', width: '100%', padding: '0.875rem 3rem 0.875rem 1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '0.875rem', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#1e293b', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button 
          onClick={() => { setIsAdminMode(!isAdminMode); setErrorMsg(null); setShowPassword(false); }} 
          className="text-gray-400 hover:text-amber-500 transition-colors"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
        >
          {isAdminMode ? '→ Retourner à la connexion établissement' : '→ Accès Administrateur'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => {}} className="text-gray-400 hover:text-amber-500 transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Politique de Confidentialité</button>
          <button onClick={() => {}} className="text-gray-400 hover:text-amber-500 transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Conditions d'Utilisation</button>
        </div>
      </div>
    </div>
  );
};