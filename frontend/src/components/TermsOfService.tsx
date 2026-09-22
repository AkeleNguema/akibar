import React from 'react';
import { Helmet } from 'react-helmet-async';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Conditions Générales d'Utilisation - Akibar</title>
        <meta name="description" content="Conditions Générales d'Utilisation de l'application Akibar." />
      </Helmet>

      <div style={{
        maxWidth: '48rem', /* max-w-3xl */
        margin: '2rem auto', /* my-8 */
        padding: '2rem', /* p-8 */
        backgroundColor: 'rgba(15, 23, 42, 0.8)', /* bg-slate-900/80 */
        border: '1px solid #1e293b', /* border-slate-800 */
        borderRadius: '1rem', /* rounded-2xl */
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', /* shadow-xl */
        textAlign: 'left'
      }}>
        
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
          &larr; Retour
        </button>

        <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Conditions Générales d'Utilisation (CGU)
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          1. Objet
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          Les présentes CGU définissent les conditions d'utilisation de l'application Akibar, destinée à la gestion des ventes, stocks et ardoises de l'établissement.
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          2. Accès à l'application
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          L'accès est restreint au personnel autorisé de l'établissement. Les identifiants sont strictement personnels et confidentiels.
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          3. Responsabilité de l'utilisateur
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          L'utilisateur s'engage à utiliser l'application de manière professionnelle, en garantissant l'exactitude des saisies (ventes, encaissements, clôtures).
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          4. Propriété intellectuelle
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          L'ensemble de l'application (code, interface) reste la propriété de ses développeurs et ayants droit. Toute reproduction ou utilisation non autorisée est interdite.
        </p>
      </div>
    </div>
  );
};
