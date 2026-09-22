import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>Politique de Confidentialité - Akibar</title>
        <meta name="description" content="Politique de confidentialité et gestion des données personnelles de l'application Akibar." />
      </Helmet>
      
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        &larr; Retour
      </button>

      <h1>Politique de Confidentialité (RGPD)</h1>
      <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <h2>1. Collecte des données</h2>
      <p>Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de l'application (identifiants, logs d'actions de caisse).</p>

      <h2>2. Utilisation des données</h2>
      <p>Les données sont utilisées pour la gestion interne de l'établissement (stocks, ventes, ardoises) et ne sont ni vendues, ni partagées à des tiers.</p>

      <h2>3. Droits des utilisateurs</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression de vos données. Vous pouvez exercer ce droit en contactant l'administrateur de l'établissement.</p>

      <h2>4. Cookies</h2>
      <p>Nous utilisons des cookies techniques indispensables au maintien de votre session et à la sécurité de l'application.</p>
    </div>
  );
};
