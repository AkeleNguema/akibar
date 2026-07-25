 🍺 AKIBAR — PWA de Gestion de Caisse, Stocks, Consignes & Finances

 Akibar    est une application web progressive (   PWA   ) Offline-First conçue sur mesure pour digitaliser, fluidifier et sécuriser la gestion quotidienne des bars, maquis et snacks au Gabon.

 

  📌 Présentation du Projet

Sur le terrain, les établissements de restauration et débits de boissons au Gabon font face à des défis opérationnels constants   instabilité du réseau mobile 3G/4G, hétérogénéité des équipements (smartphones, tablettes, PC) et complexité liée à la gestion des emballages (casiers/consignes)   .

   Akibar    apporte une réponse moderne et adaptée  
  🔌  Moteur Offline-First      Continuez à encaisser en mode déconnecté (via  IndexedDB   ), les données se synchronisent automatiquement au retour du réseau   .
  📦  Catalogue Sobraga Pré-chargé      Intégration par défaut des boissons locales (Régab, Castel, Beaufort, Djino, etc.) avec gestion des prix par casier ou bouteille   .
  🍾  Gestion des Consignes & Casiers      Suivi strict des casiers vides en réserve et des consignes prêtées aux clients lors des livraisons ou ventes   .
  📊  Calcul des Marges & Bilan Z      Calcul automatique du prix unitaire d'achat, de la marge brute et gestion des clôtures de caisse guidées pour repérer les écarts   .
  📱  Paiements Locaux      Ventilation des encaissements par Espèces (FCFA), Airtel Money et Moov Money   .
  🌙  UI/UX Dark Mode Natif      Ergonomie tactile adaptée aux environnements sombres et aux coups de feu en service   .

 

  🛠️ Stack Technique

  Composant   Technologie   Rôle & Justification  
                
   Frontend      React (Vite.js) + Tailwind CSS   Application PWA tactile, réactive et utilisable sans installation   .  
   Stockage Local      IndexedDB + Service Workers   Sauvegarde locale des ventes et résilience hors-réseau   .  
   Backend API      Node.js + Express   Traitement des requêtes, authentification par PIN et règles métiers   .  
   Base de Données      PostgreSQL (Neon) via Prisma ORM   Garantie de l'intégrité transactionnelle (ventes, stocks, consignes)   .  

 

  🗄️ Modèle de Données (Entités Prisma)

Le schéma Prisma est conçu pour couvrir l'ensemble des besoins métiers  

   `bars`      Identifiant unique (`[CODE_BAR]`), code PIN hashé et nom de l'établissement   .
   `produits`      Nom, conversion casier/bouteilles, prix d'achat casier, prix de vente bouteille   .
   `stocks`      Quantité de bouteilles en réserve et casiers vides   .
   `ventes`    &  `ligne_ventes`      Transactions de caisse, modes de paiement, prix unitaires   .
   `consignes`      Suivi des casiers et emballages consignés par client   .
   `depenses`      Charges d'exploitation (glace, électricité, loyer, salaires)   .
   `clotures_caisse`      Rapprochement guidé (Bilans X/Z) et calcul des écarts   .

 

  🛣️ Feuille de Route (Roadmap)

   
Étape 1   Socle Backend & Sécurité Prisma     (En cours)    
    Modélisation PostgreSQL & Prisma ORM   
    Authentification sécurisée par PIN établissement   
    API Express des Produits, Stocks et Ventes   
   
Étape 2   Interface Frontend & Catalogue Sobraga      
    Composants UI Tailwind CSS (Palette Ambré #F59E0B & Bleu Nuit #0F172A)   
    Paramétrage établissement et catalogue pré-rempli   
   
Étape 3   Module POS Caisse & Moteur Offline      
    Interface d'encaissement tactile, ardoises et gestion des pertes   
    Intégration IndexedDB et Service Workers pour le mode déconnecté   
   
Étape 4   Stocks, Consignes & Clôture Z      
    Suivi des casiers vides, enregistrement des dépenses et bilan financier   

 

  💻 Démarrage Rapide (Développement Backend)

 #  Prérequis
  Node.js (v18+)
  Un compte PostgreSQL (ex  Neon.tech)

 #  Installation
 bash
 # Cloner le projet
 git clone [https //github.com/AkeleNguema/akibar.git](https //github.com/AkeleNguema/akibar.git)
 cd akibar/backend

 # Installer les dépendances
 npm install
