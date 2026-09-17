import api from './api';
import { db, type OfflineSale } from './db';

// Écouteur et état de connectivité réseau
export const isOnline = (): boolean => navigator.onLine;

// Enregistre une vente dans la file locale
export const queueOfflineSale = async (sale: Omit<OfflineSale, 'id' | 'synced' | 'createdAt'>): Promise<number> => {
  return await db.offlineSales.add({
    ...sale,
    createdAt: new Date().toISOString(),
    synced: false,
  });
};

// Envoie les ventes en attente vers l'API backend
export const syncOfflineSales = async (): Promise<{ success: number; failed: number }> => {
  if (!isOnline()) return { success: 0, failed: 0 };

  const pendingSales = await db.offlineSales.where('synced').equals(0).toArray();
  let success = 0;
  let failed = 0;

  for (const sale of pendingSales) {
    try {
      await api.post('/api/sales', {
        items: [{
          productId: sale.productId,
          quantite: sale.quantite,
        }],
        paymentMode: sale.paymentMode,
        nomClient: sale.nomClient,
        syncId: sale.syncId, // 💡 Envoi de la clé d'idempotence au backend
      });

      // Supprime la vente de la file après validation serveur
      if (sale.id) {
        await db.offlineSales.delete(sale.id);
      }
      success++;
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la vente:', sale.id, error);
      failed++;
    }
  }

  return { success, failed };
};

// Initialise l'auto-synchronisation lors du retour en ligne
export const initSyncListeners = (onStatusChange?: (online: boolean) => void): (() => void) => {
  const handleOnline = () => {
    onStatusChange?.(true);
    syncOfflineSales();
  };

  const handleOffline = () => {
    onStatusChange?.(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
