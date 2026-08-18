import { getProducts, supplyStock } from '../services/stockService';
import React, { useEffect, useState } from 'react';
import '../styles/stock.css';

export const StockManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [casiersCount, setCasiersCount] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProductsList = async () => {
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      if (list.length > 0 && !selectedProductId) {
        setSelectedProductId(list[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement stock:', err);
      setMessage({ text: 'Impossible de charger le stock.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !casiersCount || Number(casiersCount) <= 0) {
      setMessage({ text: 'Veuillez saisir un nombre valide de casiers.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await supplyStock({
        productId: selectedProductId,
        nombreCasiers: Number(casiersCount),
      });

      setMessage({ text: 'Approvisionnement enregistré avec succès !', type: 'success' });
      setCasiersCount('');
      await fetchProductsList();
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || err.response?.data?.error || 'Erreur lors de l’entrée de stock.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-container">
      {message && <div className={`feedback-msg ${message.type}`}>{message.text}</div>}

      <div className="stock-card">
        <h3>Entrée de Stock (Casiers)</h3>
        <form onSubmit={handleStockSubmit} className="stock-form">
          <div className="form-group">
            <label>Boisson / Casier Sobraga</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.bouteillesParCasier || 24} btls/casier)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nombre de Casiers</label>
            <input
              type="number"
              min="1"
              placeholder="Ex : 5"
              className="form-input-stock"
              value={casiersCount}
              onChange={(e) => setCasiersCount(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <button type="submit" className="submit-stock-btn" disabled={loading}>
            {loading ? 'Ajout...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      <div className="stock-card">
        <h3>État du Stock Disponible</h3>
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix Vente / Btl</th>
                <th>Stock Bouteilles</th>
                <th>Équivalent Casiers</th>
                <th>Emballages Vides</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = Array.isArray(product.stocks) && product.stocks.length > 0 
                  ? product.stocks[0] 
                  : null;

                const totalBouteilles = stock ? stock.quantiteBouteilles : 0;
                const casiersVides = stock ? stock.casiersVides : 0;
                const parCasier = product.bouteillesParCasier || 24;

                const casiers = Math.floor(totalBouteilles / parCasier);
                const restBouteilles = totalBouteilles % parCasier;

                return (
                  <tr key={product.id}>
                    <td><strong>{product.nom}</strong></td>
                    <td>{(product.prixVenteBouteille || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td>
                      <span className="badge-bouteilles">{totalBouteilles} btls</span>
                    </td>
                    <td>
                      <span className="badge-casiers">
                        {casiers} c. {restBouteilles > 0 ? `+ ${restBouteilles} b.` : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>{casiersVides} casiers</span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    Aucun produit enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};