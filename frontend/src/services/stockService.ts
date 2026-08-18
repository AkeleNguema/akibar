import api from './api';

export interface Product {
  id: string;
  nom: string;
  categorie: string;
  bouteillesParCasier: number;
  prixAchatCasier: number;
  prixVenteBouteille: number;
  seuilStockBas: number;
}

export interface StockItem {
  id: string;
  productId: string;
  quantiteBouteilles: number;
  casiersVides: number;
  product: Product;
}

export interface SupplyPayload {
  productId: string;
  nombreCasiers: number;
}

// Récupérer le catalogue des produits
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products');
  return response.data;
};

// Récupérer l'état du stock avec les données produit
export const getStockStatus = async (): Promise<StockItem[]> => {
  const response = await api.get('/api/stock');
  return response.data;
};

// Approvisionnement : route POST /api/stock/supply
export const supplyStock = async (payload: SupplyPayload) => {
  const response = await api.post('/api/stock/supply', payload);
  return response.data;
};