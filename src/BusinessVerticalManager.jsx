import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Plus, Trash2, Tag, Archive } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function BusinessVerticalManager() {
  const [verticals, setVerticals] = useState([]);
  const [newVerticalName, setNewVerticalName] = useState('');
  const [selectedVertical, setSelectedVertical] = useState(null);
  const [products, setProducts] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVerticals();
  }, []);

  useEffect(() => {
    if (selectedVertical) {
      fetchProducts(selectedVertical.id);
    }
  }, [selectedVertical]);

  const fetchVerticals = async () => {
    try {
      const res = await axios.get(`${apiBase}/business-verticals/`, { withCredentials: true });
      setVerticals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (verticalId) => {
    try {
      const res = await axios.get(`${apiBase}/master-products/?vertical=${verticalId}`, { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createVertical = async (e) => {
    e.preventDefault();
    if (!newVerticalName) return;
    try {
      const res = await axios.post(`${apiBase}/business-verticals/`, { name: newVerticalName }, { withCredentials: true });
      setVerticals([...verticals, res.data]);
      setNewVerticalName('');
    } catch (err) {
      alert(err.response?.data?.name?.[0] || 'Failed to create vertical');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedVertical) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('vertical_id', selectedVertical.id);
    
    try {
      const res = await axios.post(`${apiBase}/master-products/upload-csv/`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      fetchProducts(selectedVertical.id);
      setCsvFile(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Verticals List */}
      <div style={{ flex: '1', background: 'var(--panel-bg)', padding: '20px', borderRadius: 'var(--panel-radius)', border: 'var(--panel-border)', boxShadow: 'var(--panel-shadow)' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Archive size={18} /> Business Verticals</h3>
        <form onSubmit={createVertical} style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <input 
            value={newVerticalName} 
            onChange={e => setNewVerticalName(e.target.value)} 
            placeholder="e.g. Pharmacy, Supermarket"
            style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
          <button className="primary" style={{ padding: '8px 12px' }}><Plus size={16} /></button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {verticals.map(v => (
            <div 
              key={v.id} 
              onClick={() => setSelectedVertical(v)}
              style={{ 
                padding: '12px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '6px', 
                cursor: 'pointer',
                background: selectedVertical?.id === v.id ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                borderColor: selectedVertical?.id === v.id ? '#0f766e' : '#e2e8f0',
                fontWeight: selectedVertical?.id === v.id ? 'bold' : 'normal'
              }}
            >
              {v.name}
            </div>
          ))}
        </div>
      </div>

      {/* Products Manager */}
      <div style={{ flex: '2', background: 'var(--panel-bg)', padding: '20px', borderRadius: 'var(--panel-radius)', border: 'var(--panel-border)', boxShadow: 'var(--panel-shadow)' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={18} /> Master Products Catalog</h3>
        
        {!selectedVertical ? (
          <p style={{ color: '#64748b' }}>Select a business vertical from the left to manage its product catalog.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>{selectedVertical.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{products.length} products listed</p>
              </div>
              
              <form onSubmit={handleCsvUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={e => setCsvFile(e.target.files[0])}
                  style={{ fontSize: '13px' }}
                />
                <button 
                  disabled={!csvFile || uploading} 
                  className="primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                >
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </form>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Product Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Generic / Brand</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #cbd5e1' }}>Default Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px' }}>{p.name} {p.weight_unit && <span style={{ color: '#64748b', fontSize: '11px' }}>({p.weight_unit})</span>}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.generic_name || p.barcode || '-'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '500' }}>{Number(p.default_unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No products found. Upload a CSV.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
