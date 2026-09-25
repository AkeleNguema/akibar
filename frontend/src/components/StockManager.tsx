import { getProducts, supplyStock, returnEmptyCrates } from '../services/stockService';
import { getConsignes, createConsigne, updateConsigneStatut } from '../services/consigneService';
import React, { useEffect, useState } from 'react';
import '../styles/stock.css';

export const StockManager: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [consignes, setConsignes] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [casiersCount, setCasiersCount] = useState<number | ''>('');
  const [consigneNom, setConsigneNom] = useState<string>('');
  const [consigneCasiers, setConsigneCasiers] = useState<number | ''>('');
  
  const [returnProductId, setReturnProductId] = useState<string>('');
  const [returnCount, setReturnCount] = useState<number | ''>('');
  const [rembourser, setRembourser] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProductsList = async () => {
    try {
      setMessage(null);
      const data = await getProducts();
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      if (list.length > 0 && !selectedProductId) {
        setSelectedProductId(list[0].id);
        if (!returnProductId) setReturnProductId(list[0].id);
      }
      const consigneData = await getConsignes();
      setConsignes(Array.isArray(consigneData) ? consigneData : []);
    } catch (err) {
      console.error('Erreur chargement stock/consignes:', err);
      setProducts(prev => {
        if (prev.length === 0) {
          setMessage({ text: 'Impossible de charger les données.', type: 'error' });
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProductsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleConsigneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consigneNom || !consigneCasiers || Number(consigneCasiers) <= 0) return;

    setLoading(true);
    try {
      await createConsigne({ nomClient: consigneNom, nombreCasiers: Number(consigneCasiers) });
      setMessage({ text: 'Consigne enregistrée !', type: 'success' });
      setConsigneNom('');
      setConsigneCasiers('');
      await fetchProductsList();
    } catch (err) {
      setMessage({ text: 'Erreur lors de la création de la consigne.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnCratesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnProductId || !returnCount || Number(returnCount) <= 0) {
      setMessage({ text: 'Veuillez saisir un nombre valide d\'emballages.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await returnEmptyCrates({
        productId: returnProductId,
        nombreCasiers: Number(returnCount),
        rembourser
      });
      setMessage({ text: 'Emballages retournés avec succès !', type: 'success' });
      setReturnCount('');
      setRembourser(false);
      await fetchProductsList();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Erreur lors du retour d\'emballages.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatutConsigne = async (id: string, currentStatut: string) => {
    try {
      const newStatut = currentStatut === 'EN_COURS' ? 'RESTITUE' : 'EN_COURS';
      await updateConsigneStatut(id, newStatut);
      await fetchProductsList();
    } catch (err) {
      console.error(err);
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
        <h3>Retourner Emballages Vides</h3>
        <form onSubmit={handleReturnCratesSubmit} className="stock-form">
          <div className="form-group">
            <label>Boisson / Casier Sobraga</label>
            <select
              className="form-select"
              value={returnProductId}
              onChange={(e) => setReturnProductId(e.target.value)}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nombre de Casiers Vides</label>
            <input
              type="number"
              min="1"
              placeholder="Ex : 5"
              className="form-input-stock"
              value={returnCount}
              onChange={(e) => setReturnCount(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="rembourser"
              checked={rembourser}
              onChange={(e) => setRembourser(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="rembourser" style={{ cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
              Rembourser le client (2000 FCFA/casier)
            </label>
          </div>

          <button type="submit" className="submit-stock-btn" disabled={loading} style={{ background: '#f59e0b', color: '#000' }}>
            {loading ? 'En cours...' : 'Retourner Emballages'}
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

      <div className="stock-card">
        <h3>Gestion des Consignes / Casiers</h3>
        <form onSubmit={handleConsigneSubmit} className="stock-form" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>Nom Livreur / Client</label>
            <input type="text" placeholder="Ex: Livreur Sobraga" className="form-input-stock" value={consigneNom} onChange={(e) => setConsigneNom(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nombre de Casiers</label>
            <input type="number" min="1" className="form-input-stock" value={consigneCasiers} onChange={(e) => setConsigneCasiers(e.target.value === '' ? '' : Number(e.target.value))} required />
          </div>
          <button type="submit" className="submit-stock-btn" disabled={loading}>
            {loading ? 'En cours...' : 'Ajouter Consigne'}
          </button>
        </form>
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nom</th>
                <th>Casiers</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {consignes.map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{c.nomClient}</td>
                  <td>{c.nombreCasiers} casiers</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: c.statut === 'EN_COURS' ? '#fef3c7' : '#dcfce7', color: c.statut === 'EN_COURS' ? '#b45309' : '#166534' }}>
                      {c.statut === 'EN_COURS' ? 'En cours' : 'Restitué'}
                    </span>
                  </td>
                  <td>
                    <button type="button" onClick={() => handleStatutConsigne(c.id, c.statut)} style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}>
                      Changer
                    </button>
                  </td>
                </tr>
              ))}
              {consignes.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:'center', color:'#94a3b8'}}>Aucune consigne.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};