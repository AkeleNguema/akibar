import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import '../styles/app.css';
import { 
  Building2, Plus, LogOut, Search, Eye, Edit2, Shield, LogIn, Activity, Power, X, MoreVertical
} from 'lucide-react';

interface Bar {
  id: string;
  nomBar: string;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  userCount: number;
}

export const SuperAdminDashboard: React.FC<{ onLogout: () => void, onEnterAssistance: (id: string) => void }> = ({ onLogout, onEnterAssistance }) => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBar, setEditingBar] = useState<Bar | null>(null);
  const [viewingBar, setViewingBar] = useState<Bar | null>(null);

  // Form state (shared between create and edit where applicable)
  const [formData, setFormData] = useState({
    nomBar: '',
    pinGerant: '',
    pinProprietaire: '',
    status: 'ACTIVE'
  });

  const fetchBars = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/bars');
      setBars(res.data);
    } catch (error) {
      console.error('Erreur chargement bars', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBars();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/bars', formData);
      setIsCreateModalOpen(false);
      resetForm();
      fetchBars();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBar) return;
    try {
      await api.patch(`/api/admin/bars/${editingBar.id}`, {
        nomBar: formData.nomBar,
        status: formData.status,
        ...(formData.pinGerant && { pinGerant: formData.pinGerant }),
        ...(formData.pinProprietaire && { pinProprietaire: formData.pinProprietaire }),
      });
      setEditingBar(null);
      resetForm();
      fetchBars();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  const toggleBarStatus = async (bar: Bar) => {
    const newStatus = bar.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Voulez-vous vraiment passer ce bar en ${newStatus} ?`)) return;
    try {
      await api.patch(`/api/admin/bars/${bar.id}`, { status: newStatus });
      fetchBars();
    } catch (error: any) {
      alert('Erreur lors du changement de statut');
    }
  };

  const resetForm = () => {
    setFormData({ nomBar: '', pinGerant: '', pinProprietaire: '', status: 'ACTIVE' });
  };

  const openEditModal = (bar: Bar) => {
    setEditingBar(bar);
    setFormData({
      nomBar: bar.nomBar,
      pinGerant: '', // Ne jamais afficher les PIN existants
      pinProprietaire: '',
      status: bar.status
    });
  };

  const filteredBars = useMemo(() => {
    return bars.filter(b => {
      const matchSearch = b.nomBar.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bars, searchTerm, statusFilter]);

  const activeBars = bars.filter(b => b.status === 'ACTIVE').length;
  const inactiveBars = bars.filter(b => b.status === 'INACTIVE').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '20px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Shield size={36} color="#f59e0b" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Administration Akibar</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Gestion des établissements et supervision</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </header>

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Building2 size={32} color="#3b82f6" />
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Bars Totaux</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{bars.length}</h2>
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Activity size={32} color="#10b981" />
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Bars Actifs</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{activeBars}</h2>
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Power size={32} color="#ef4444" />
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Bars Inactifs</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{inactiveBars}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Rechercher par ID ou nom..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 35px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)}
            style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
          </select>
        </div>
        <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          <Plus size={18} /> Nouveau Bar
        </button>
      </div>

      {/* LISTE DES BARS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Chargement des établissements...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '15px' }}>ID</th>
                <th style={{ padding: '15px' }}>Nom</th>
                <th style={{ padding: '15px' }}>Date création</th>
                <th style={{ padding: '15px' }}>Statut</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBars.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Aucun établissement trouvé.</td></tr>
              )}
              {filteredBars.map(bar => (
                <tr key={bar.id} style={{ borderBottom: '1px solid #334155', background: bar.status === 'INACTIVE' ? '#1e293b80' : 'transparent' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{bar.id}</td>
                  <td style={{ padding: '15px' }}>{bar.nomBar}</td>
                  <td style={{ padding: '15px' }}>{new Date(bar.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: bar.status === 'ACTIVE' ? '#10b98120' : '#ef444420', color: bar.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                      {bar.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button title="Détails" onClick={() => setViewingBar(bar)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px' }}><Eye size={18} /></button>
                    <button title="Modifier" onClick={() => openEditModal(bar)} style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '5px' }}><Edit2 size={18} /></button>
                    <button title={bar.status === 'ACTIVE' ? 'Désactiver' : 'Activer'} onClick={() => toggleBarStatus(bar)} style={{ background: 'transparent', border: 'none', color: bar.status === 'ACTIVE' ? '#ef4444' : '#10b981', cursor: 'pointer', padding: '5px' }}><Power size={18} /></button>
                    {bar.status === 'ACTIVE' && (
                      <button title="Assistance à distance" onClick={() => onEnterAssistance(bar.id)} style={{ background: '#3b82f620', border: '1px solid #3b82f650', color: '#3b82f6', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <LogIn size={14} /> Accéder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREATION / EDITION */}
      {(isCreateModalOpen || editingBar) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '450px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{editingBar ? 'Modifier un Bar' : 'Créer un Bar'}</h3>
              <button onClick={() => { setIsCreateModalOpen(false); setEditingBar(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={editingBar ? handleEditSubmit : handleCreateSubmit} style={{ padding: '20px', display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Nom du Bar</label>
                <input required value={formData.nomBar} onChange={e => setFormData({...formData, nomBar: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} placeholder="Nom affiché" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>PIN Gérant {editingBar && '(Optionnel : laisser vide pour ne pas modifier)'}</label>
                <input required={!editingBar} type="password" maxLength={4} minLength={4} pattern="\d{4}" title="4 chiffres requis" value={formData.pinGerant} onChange={e => setFormData({...formData, pinGerant: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} placeholder="4 chiffres exacts" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>PIN Propriétaire {editingBar && '(Optionnel : laisser vide pour ne pas modifier)'}</label>
                <input type="password" maxLength={4} minLength={4} pattern="\d{4}" title="4 chiffres requis" value={formData.pinProprietaire} onChange={e => setFormData({...formData, pinProprietaire: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} placeholder="Facultatif (4 chiffres)" />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                {editingBar ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAILS */}
      {viewingBar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Building2 size={20} color="#f59e0b" /> Détails de l'établissement</h3>
              <button onClick={() => setViewingBar(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>ID du Bar</span>
                <span style={{ fontWeight: 'bold' }}>{viewingBar.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Nom affiché</span>
                <span style={{ fontWeight: 'bold' }}>{viewingBar.nomBar}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Date de création</span>
                <span style={{ fontWeight: 'bold' }}>{new Date(viewingBar.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Statut</span>
                <span style={{ fontWeight: 'bold', color: viewingBar.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>{viewingBar.status === 'ACTIVE' ? 'Actif' : 'Inactif'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Utilisateurs rattachés</span>
                <span style={{ fontWeight: 'bold' }}>{viewingBar.userCount} (Gérant{viewingBar.userCount > 1 ? ' + Propriétaire' : ''})</span>
              </div>
            </div>
            {viewingBar.status === 'ACTIVE' && (
              <div style={{ padding: '20px', background: '#0f172a', borderTop: '1px solid #334155' }}>
                <button onClick={() => onEnterAssistance(viewingBar.id)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <LogIn size={18} /> Accéder en mode assistance
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
