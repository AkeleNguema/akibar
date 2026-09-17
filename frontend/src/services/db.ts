import Dexie, { type Table } from 'dexie';

// Type pour les produits en cache local
export interface CachedProduct {
  id: string;
  nom: string;
  categorie: string;
  prixVenteBouteille: number;
  prixAchatCasier: number;
  bouteillesParCasier: number;
  seuilStockBas: number;
  quantiteBouteilles?: number;
  casiersVides?: number;
}

// Type pour les ventes en file d'attente locale
export interface OfflineSale {
  id?: number;
  syncId: string; // Identifiant unique d'idempotence
  productId: string;
  quantite: number;
  paymentMode: 'ESPECES' | 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'ARDOISE';
  nomClient?: string;
  createdAt: string;
  synced: boolean;
}

// Base de données IndexedDB Akibar
export class AkibarDB extends Dexie {
  products!: Table<CachedProduct, string>;
  offlineSales!: Table<OfflineSale, number>;

  constructor() {
    super('AkibarDB');
    this.version(1).stores({
      products: 'id, nom, categorie',
      offlineSales: '++id, productId, synced, createdAt',
    });
  }
}

export const db = new AkibarDB();
