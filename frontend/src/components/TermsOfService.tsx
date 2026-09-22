import React from 'react';
import { Helmet } from 'react-helmet-async';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>Conditions Générales d'Utilisation - Akibar</title>
        <meta name="description" content="Conditions Générales d'Utilisation de l'application Akibar." />
      </Helmet>

      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        &larr; Retour
      </button>

      <h1>Conditions Générales d'Utilisation (CGU)</h1>
      <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <h2>1. Objet</h2>
      <p>Les présentes CGU définissent les conditions d'utilisation de l'application Akibar, destinée à la gestion des ventes, stocks et ardoises de l'établissement.</p>

      <h2>2. Accès à l'application</h2>
      <p>L'accès est restreint au personnel autorisé de l'établissement. Les identifiants sont strictement personnels et confidentiels.</p>

      <h2>3. Responsabilité de l'utilisateur</h2>
      <p>L'utilisateur s'engage à utiliser l'application de manière professionnelle, en garantissant l'exactitude des saisies (ventes, encaissements, clôtures).</p>

      <h2>4. Propriété intellectuelle</h2>
      <p>L'ensemble de l'application (code, interface) reste la propriété de ses développeurs et ayants droit. Toute reproduction ou utilisation non autorisée est interdite.</p>
    </div>
  );
};
