import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Politique de Confidentialité - Akibar</title>
        <meta name="description" content="Politique de confidentialité et gestion des données personnelles de l'application Akibar." />
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
          Politique de Confidentialité (RGPD)
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          1. Collecte des données
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de l'application (identifiants, logs d'actions de caisse).
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          2. Utilisation des données
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          Les données sont utilisées pour la gestion interne de l'établissement (stocks, ventes, ardoises) et ne sont ni vendues, ni partagées à des tiers.
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          3. Droits des utilisateurs
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression de vos données. Vous pouvez exercer ce droit en contactant l'administrateur de l'établissement.
        </p>

        <h2 style={{ color: '#fbbf24', fontWeight: 600, fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          4. Cookies
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.625 }}>
          Nous utilisons des cookies techniques indispensables au maintien de votre session et à la sécurité de l'application.
        </p>
      </div>
    </div>
  );
};
