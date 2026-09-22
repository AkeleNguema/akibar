import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/stockService';
import { createSale } from '../services/saleService';
import { isOnline, queueOfflineSale } from '../services/syncService';
import { updateTableCart } from '../services/tableService';
import type { Table } from '../services/tableService';
import { TablesView } from './TablesView';
import '../styles/cashRegister.css';

interface CartItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  quantite: number;
}

export const CashRegister: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'ESPECES' | 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'ARDOISE'>('ESPECES');
  const [nomClient, setNomClient] = useState<string>('');
  const [montantRecu, setMontantRecu] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saleType, setSaleType] = useState<'VENTE' | 'PERTE' | 'CASSE' | 'OFFERT'>('VENTE');
  const [consigneCasiers, setConsigneCasiers] = useState<number | ''>('');

  const [showTables, setShowTables] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const loadCatalog = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement catalogue:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCatalog();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToCart = (product: any) => {
    const stock = Array.isArray(product.stocks) && product.stocks.length > 0 ? product.stocks[0].quantiteBouteilles : 0;
    if (stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantite + 1 > stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { product, quantite: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const stock = Array.isArray(item.product.stocks) && item.product.stocks.length > 0
              ? item.product.stocks[0].quantiteBouteilles
              : 0;
            const nextQty = item.quantite + delta;
            if (nextQty > stock) return item;
            return { ...item, quantite: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantite > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.product.prixVenteBouteille || 0) * item.quantite,
    0
  ) + (typeof consigneCasiers === 'number' ? consigneCasiers * 2000 : 0);

  const monnaie = typeof montantRecu === 'number' && montantRecu >= totalAmount ? montantRecu - totalAmount : 0;

  const handleSaleSubmit = async () => {
    if (cart.length === 0 || totalAmount <= 0) return;

    if (paymentMode === 'ARDOISE' && !nomClient.trim()) {
      setMessage({ text: 'Nom du client requis pour une ardoise.', type: 'error' });
      return;
    }

    if (consigneCasiers !== '' && consigneCasiers > 0 && !nomClient.trim()) {
      setMessage({ text: 'Nom du client requis pour enregistrer une consigne.', type: 'error' });
      return;
    }

    if (paymentMode === 'ESPECES' && typeof montantRecu === 'number' && montantRecu < totalAmount) {
      setMessage({ text: 'Montant reçu insuffisant.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isOnline()) {
        const syncId = crypto.randomUUID(); // Génération d'une clé d'idempotence
        await createSale({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantite: item.quantite,
            typeVente: saleType,
          })),
          totalAmount: saleType === 'VENTE' ? totalAmount : 0,
          paymentMode,
          nomClient: (paymentMode === 'ARDOISE' || (typeof consigneCasiers === 'number' && consigneCasiers > 0)) ? nomClient.trim() : undefined,
          syncId,
          tableId: selectedTable?.id,
          consigneCasiers: typeof consigneCasiers === 'number' ? consigneCasiers : 0,
        });
        setMessage({ text: 'Vente encaissee avec succès !', type: 'success' });
      } else {
        // Sauvegarde hors-ligne pour chaque produit du panier
        for (const item of cart) {
          await queueOfflineSale({
            syncId: crypto.randomUUID(), // Clé unique pour chaque item hors ligne
            productId: item.product.id,
            quantite: item.quantite,
            typeVente: saleType,
            paymentMode,
            nomClient: paymentMode === 'ARDOISE' ? nomClient.trim() : undefined,
          });
        }
        setMessage({ text: 'Réseau hors ligne : Vente enregistrée en local (en attente de synchronisation).', type: 'success' });
      }

      setCart([]);
      setMontantRecu('');
      setNomClient('');
      setConsigneCasiers('');
      await loadCatalog();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors du règlement.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePutOnHold = async () => {
    if (!selectedTable) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateTableCart(selectedTable.id, cart);
      setMessage({ text: 'Commande mise en attente avec succès.', type: 'success' });
      setCart([]);
      setSelectedTable(null);
      setShowTables(true);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: 'Erreur lors de la mise en attente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setShowTables(false);
    if (table.currentCart && Array.isArray(table.currentCart)) {
      setCart(table.currentCart);
    } else {
      setCart([]);
    }
  };

  if (showTables) {
    return (
      <TablesView 
        onSelectTable={handleSelectTable} 
        onBack={() => setShowTables(false)} 
      />
    );
  }

  return (
    <div className="cash-container">
      <div>
        {message && <div className={`feedback-msg ${message.type}`}>{message.text}</div>}

        <div className="products-grid">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {products.map((product: any) => {
            const stock = Array.isArray(product.stocks) && product.stocks.length > 0
              ? product.stocks[0].quantiteBouteilles
              : 0;
            const isOutOfStock = stock <= 0;

            return (
              <button
                type="button"
                key={product.id}
                className={`product-btn-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                aria-label={`Ajouter ${product.nom} au panier. Prix: ${product.prixVenteBouteille} FCFA`}
                role="button"
              >
                <div className="p-name">{product.nom}</div>
                <div className="p-price">{(product.prixVenteBouteille || 0).toLocaleString('fr-FR')} FCFA</div>
                <div className="p-stock">{isOutOfStock ? 'Rupture' : `${stock} btls en stock`}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cart-panel">
        <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="cart-title">
            {selectedTable ? `Table: ${selectedTable.nom}` : 'Caisse / Ticket'}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowTables(true)}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Choisir table
            </button>
            {cart.length > 0 && (
              <button 
                type="button" 
                onClick={() => setCart([])}
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                🗑️ Vider
              </button>
            )}
          </div>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 && (
            <div style={{ color: '#94a3b8', textAlign: 'center', margin: 'auto' }}>
              Cliquez sur une boisson
            </div>
          )}
          {cart.map((item) => (
            <div key={item.product.id} className="cart-item-row">
              <div className="cart-item-info">
                <span>{item.product.nom}</span>
                <small>{((item.product.prixVenteBouteille || 0) * item.quantite).toLocaleString('fr-FR')} FCFA</small>
              </div>
              <div className="cart-item-actions">
                <button type="button" className="btn-qty" onClick={() => updateQuantity(item.product.id, -1)} aria-label="Diminuer la quantité">-</button>
                <span style={{ color: '#fff', fontWeight: 700 }} aria-live="polite">{item.quantite}</span>
                <button type="button" className="btn-qty" onClick={() => updateQuantity(item.product.id, 1)} aria-label="Augmenter la quantité">+</button>
                <button type="button" className="btn-remove" onClick={() => removeItem(item.product.id)} aria-label="Supprimer du panier">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="total-row">
            <span>Total :</span>
            <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>

          <div className="pay-group">
            <label>Mode de règlement</label>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
              <option value="ESPECES">Espèces (Cash)</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="MOOV_MONEY">Moov Money</option>
              <option value="ARDOISE">Ardoise (Crédit)</option>
            </select>
          </div>

          <div className="pay-group">
            <label>Type d'opération</label>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <select value={saleType} onChange={(e) => setSaleType(e.target.value as any)}>
              <option value="VENTE">Vente Normale</option>
              <option value="PERTE">Perte</option>
              <option value="CASSE">Casse</option>
              <option value="OFFERT">Offert (Gratuit)</option>
            </select>
          </div>

          <div className="pay-group">
            <label>Consigner des casiers (2000 F/U)</label>
            <input
              type="number"
              placeholder="0"
              value={consigneCasiers}
              onChange={(e) => setConsigneCasiers(e.target.value === '' ? '' : Number(e.target.value))}
              min="0"
            />
          </div>

          {(paymentMode === 'ARDOISE' || (typeof consigneCasiers === 'number' && consigneCasiers > 0)) ? (
            <div className="pay-group">
              <label>Nom du client {typeof consigneCasiers === 'number' && consigneCasiers > 0 && <span style={{color: '#f59e0b'}}>(Requis pour la consigne)</span>}</label>
              <input
                type="text"
                placeholder="Ex : M. Ondo"
                value={nomClient}
                onChange={(e) => setNomClient(e.target.value)}
              />
            </div>
          ) : paymentMode === 'ESPECES' ? (
            <>
              <div className="pay-group">
                <label>Espèces reçues</label>
                <input
                  type="number"
                  placeholder={`${totalAmount}`}
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              {typeof montantRecu === 'number' && montantRecu >= totalAmount && (
                <div className="change-box">
                  <span>Monnaie à rendre :</span>
                  <span>{monnaie.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
            </>
          ) : null}

          {selectedTable && cart.length > 0 && (
            <button
              type="button"
              className="btn-validate-sale"
              style={{ marginBottom: '10px', background: '#f59e0b', color: '#fff', border: 'none' }}
              disabled={loading}
              onClick={handlePutOnHold}
            >
              {loading ? 'Sauvegarde...' : 'En attente'}
            </button>
          )}

          <button
            type="button"
            className="btn-validate-sale"
            disabled={loading || cart.length === 0}
            onClick={handleSaleSubmit}
          >
            {loading ? 'Encaissement...' : 'Valider l’encaissement'}
          </button>
        </div>
      </div>
    </div>
  );
};