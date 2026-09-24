import React from 'react';
import { BarChart3, Receipt, Users } from 'lucide-react';
import '../styles/homepage.css';

interface HomePageProps {
  onNavigateToLogin: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigateToLogin, 
  onNavigateToPrivacy, 
  onNavigateToTerms 
}) => {
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="homepage-header animate-fade-in">
        <div className="brand flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="Akibar" className="w-10 h-10 object-contain rounded-lg" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
          <h1 className="brand-title" style={{ margin: 0 }}>Akibar</h1>
        </div>
        <button 
          className="header-login-btn" 
          onClick={onNavigateToLogin}
          aria-label="Se connecter à Akibar"
        >
          Connexion
        </button>
      </header>

      {/* Main Content */}
      <main className="homepage-main">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in delay-1">
          <h2 className="hero-title">
            Votre solution <span>moderne</span> de gestion de bar
          </h2>
          <p className="hero-subtitle">
            Gérez vos ventes, vos stocks, et vos serveurs en temps réel avec une interface pensée pour la rapidité et la simplicité. Même hors ligne.
          </p>
          <div className="hero-ctas">
            <button 
              className="cta-primary" 
              onClick={onNavigateToLogin}
              aria-label="Accéder à la caisse"
            >
              Accéder à la caisse
            </button>
            <button 
              className="cta-secondary"
              aria-label="Découvrir les fonctionnalités"
              onClick={() => {
                const features = document.getElementById('features');
                features?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Découvrir les fonctionnalités
            </button>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="features-section animate-fade-in delay-2">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <BarChart3 size={28} />
              </div>
              <h3 className="feature-title">Clôture & Bilan</h3>
              <p className="feature-desc">
                Suivez votre chiffre d'affaires quotidien en un clin d'œil. Calculez les écarts de caisse et gardez un historique précis.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Receipt size={28} />
              </div>
              <h3 className="feature-title">Dépenses & Ardoises</h3>
              <p className="feature-desc">
                Enregistrez vos charges, payez vos fournisseurs et gérez les crédits (ardoises) de vos clients de confiance très facilement.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users size={28} />
              </div>
              <h3 className="feature-title">Commandes par table</h3>
              <p className="feature-desc">
                Organisez les commandes par table. Idéal pour les serveurs en salle avec synchronisation en temps réel de l'état des tables.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="homepage-footer animate-fade-in delay-3">
        <div className="footer-content">
          <div className="brand flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.png" alt="Akibar" className="w-10 h-10 object-contain rounded-lg" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }} />
            <h1 className="brand-title" style={{ margin: 0, fontSize: '1.2rem' }}>Akibar</h1>
          </div>
          <div className="footer-links">
            <button onClick={onNavigateToPrivacy} aria-label="Lire la politique de confidentialité">
              Politique de Confidentialité
            </button>
            <button onClick={onNavigateToTerms} aria-label="Lire les conditions d'utilisation">
              Conditions d'Utilisation
            </button>
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
            <a href="#" aria-label="GitHub">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          Akibar © 2026 – PWA Offline-First. Conçu pour la performance.
        </div>
      </footer>
    </div>
  );
};
