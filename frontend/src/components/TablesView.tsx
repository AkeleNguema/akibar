import React, { useEffect, useState } from 'react';
import { getTables } from '../services/tableService';
import type { Table } from '../services/tableService';
import '../styles/tablesView.css';

import bateke from '../assets/masks/bateke.svg';
import fang from '../assets/masks/fang.svg';
import kidumu from '../assets/masks/kidumu.svg';
import kota from '../assets/masks/kota.svg';
import mahongwe from '../assets/masks/mahongwe.svg';
import mbete from '../assets/masks/mbete.svg';
import punu from '../assets/masks/punu.svg';
import sira from '../assets/masks/sira.svg';
import tsogo from '../assets/masks/tsogo.svg';
import vuvi from '../assets/masks/vuvi.svg';

const maskImages: Record<string, string> = {
  bateke, fang, kidumu, kota, mahongwe, mbete, punu, sira, tsogo, vuvi
};

interface TablesViewProps {
  onSelectTable: (table: Table) => void;
  onBack: () => void;
}

export const TablesView: React.FC<TablesViewProps> = ({ onSelectTable, onBack }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const data = await getTables();
        setTables(data);
      } catch (error) {
        console.error('Erreur chargement tables', error);
      } finally {
        setLoading(false);
      }
    };
    loadTables();
  }, []);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Chargement des tables...</div>;

  return (
    <div className="tables-container">
      <div className="tables-header">
        <h2>Salles & Tables</h2>
        <button type="button" className="btn-back" onClick={onBack}>Retour à la caisse</button>
      </div>

      <div className="tables-grid">
        {tables.map(table => (
          <div 
            key={table.id} 
            className={`table-card ${table.status === 'EN_ATTENTE' ? 'occupied' : 'free'}`}
            onClick={() => onSelectTable(table)}
          >
            <div className="table-badge">{table.status === 'EN_ATTENTE' ? 'Occupée' : 'Libre'}</div>
            <div className="table-title">TABLE</div>
            <div className="table-mask-placeholder">
               <img src={maskImages[table.nom.toLowerCase()]} alt={table.nom} className="table-mask-image" />
            </div>
            <div className="table-name">{table.nom}</div>
            
            {table.status === 'EN_ATTENTE' && table.currentCart && (
              <div className="table-cart-summary">
                {table.currentCart.length} article(s) en attente
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
