import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ShoppingCart, Activity, Monitor, ArrowRight, ShieldCheck, MapPin, DollarSign, Phone, FileText, Check, Box } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function OnboardingWizard({ onComplete, api }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [verticals, setVerticals] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // { id: { quantity, price, alert_level } }

  const [formData, setFormData] = useState({
    business_name: '',
    currency_symbol: 'Rs.',
    tagline: '',
    address: '',
    phone: '',
    business_type: '' // The ID or name of the business vertical
  });

  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const res = await axios.get(`${apiBase}/business-verticals/`);
        setVerticals(res.data);
      } catch (err) {
        console.error('Could not load verticals', err);
      }
    };
    fetchVerticals();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectVertical = async (vertical) => {
    setFormData({ ...formData, business_type: vertical.name });
    try {
      const res = await axios.get(`${apiBase}/master-products/?vertical=${vertical.id}`);
      setMasterProducts(res.data);
      setSelectedProducts({});
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProduct = (p) => {
    const newSel = { ...selectedProducts };
    if (newSel[p.id]) {
      delete newSel[p.id];
    } else {
      newSel[p.id] = { 
        name: p.name,
        selling_price: p.default_unit_price, 
        quantity: 10,
        low_stock_alert: 5
      };
    }
    setSelectedProducts(newSel);
  };

  const updateProductData = (id, field, val) => {
    setSelectedProducts({
      ...selectedProducts,
      [id]: { ...selectedProducts[id], [field]: val }
    });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.business_name || !formData.phone)) {
      setError('Please fill in your Business Name and Phone number.');
      return;
    }
    if (step === 2 && !formData.business_type) {
      setError('Please select a Business Vertical to proceed.');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Submit Setup
      const res = await api.post('/onboarding/setup/', formData);
      if (!res.data.success) {
        setError(res.data.detail || 'Failed to complete setup.');
        setLoading(false);
        return;
      }
      
      // 2. Add Stock items from selectedProducts
      const stockPromises = Object.values(selectedProducts).map(prod => {
        return api.post('/stock/', {
          name: prod.name,
          category: null,
          quantity: prod.quantity,
          low_stock_alert: prod.low_stock_alert,
          selling_price: prod.selling_price
        });
      });
      
      await Promise.all(stockPromises);
      
      onComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during onboarding setup.');
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card" style={{ maxWidth: step === 3 ? '800px' : '600px' }}>
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Basics</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Business Line</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Catalog Setup</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Review</div>
        </div>

        {error && (
          <div className="onboarding-error">
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <Sparkles size={32} className="header-icon" />
              <h2>Welcome to SmartLedger OS</h2>
              <p>Configure your workspace basics to get started offline.</p>
            </div>
            <div className="form-group">
              <label>Enterprise / Business Title *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g. Al-Madina Medicos"
                required
              />
            </div>
            <div className="form-group">
              <label>Business Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Quality care, wholesale prices"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Currency Symbol *</label>
                <input
                  type="text"
                  name="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={handleChange}
                  placeholder="e.g. Rs., $, AED"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 03001234567"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Physical Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Shop # 4, Block C, Main Road"
              />
            </div>
            <div className="step-actions">
              <button className="onboarding-btn primary" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Business Vertical */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Select Business Classification</h2>
              <p>Choose your vertical. We will dynamically configure the database schema, POS layout, and load the master catalog.</p>
            </div>

            <div className="verticals-grid">
              {verticals.map(v => (
                <div
                  key={v.id}
                  className={`vertical-card ${formData.business_type === v.name ? 'selected' : ''}`}
                  onClick={() => handleSelectVertical(v)}
                >
                  <div className="card-icon">
                    <Box size={24} />
                  </div>
                  <h3>{v.name}</h3>
                  <p>{v.description || 'Activate dynamic schema features for this vertical.'}</p>
                </div>
              ))}
              {verticals.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', gridColumn: 'span 2' }}>
                  No verticals configured by Superadmin yet.
                  <div style={{ marginTop: '15px' }}>
                    <input 
                      style={{ padding: '8px', width: '100%', marginBottom: '10px' }} 
                      placeholder="Type custom business type" 
                      value={formData.business_type} 
                      onChange={e => setFormData({...formData, business_type: e.target.value})} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="onboarding-btn secondary" onClick={prevStep}>Back</button>
              <button className="onboarding-btn primary" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Catalog Setup */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Initial Stock Setup</h2>
              <p>Select products from the {formData.business_type} catalog to add to your opening stock.</p>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {masterProducts.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <tr>
                      <th style={{ padding: '12px', width: '40px' }}></th>
                      <th style={{ padding: '12px' }}>Product</th>
                      <th style={{ padding: '12px', width: '100px' }}>Price</th>
                      <th style={{ padding: '12px', width: '100px' }}>Opening Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterProducts.map(p => {
                      const isSelected = !!selectedProducts[p.id];
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#f0fdf4' : 'transparent' }}>
                          <td style={{ padding: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleProduct(p)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ display: 'block' }}>{p.name}</strong>
                            {p.generic_name && <span style={{ fontSize: '12px', color: '#64748b' }}>{p.generic_name}</span>}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {isSelected ? (
                              <input 
                                type="number" 
                                value={selectedProducts[p.id].selling_price}
                                onChange={e => updateProductData(p.id, 'selling_price', e.target.value)}
                                style={{ width: '80px', padding: '6px' }}
                              />
                            ) : (
                              <span style={{ color: '#64748b' }}>{Number(p.default_unit_price)}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {isSelected ? (
                              <input 
                                type="number" 
                                value={selectedProducts[p.id].quantity}
                                onChange={e => updateProductData(p.id, 'quantity', e.target.value)}
                                style={{ width: '80px', padding: '6px' }}
                              />
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  No master products found for this vertical. You can add items later.
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#0f766e', fontWeight: 'bold' }}>
              {Object.keys(selectedProducts).length} items selected for opening stock.
            </div>

            <div className="step-actions" style={{ marginTop: '20px' }}>
              <button className="onboarding-btn secondary" onClick={prevStep}>Back</button>
              <button className="onboarding-btn primary" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Finalize */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-header">
              <ShieldCheck size={36} className="header-icon success-icon" />
              <h2>Verify Workspace Setup</h2>
              <p>Ready to compile local assets and establish schema indices.</p>
            </div>

            <div className="review-summary">
              <div className="summary-item">
                <FileText size={16} />
                <div><strong>Business Name:</strong> {formData.business_name}</div>
              </div>
              <div className="summary-item highlight">
                <ShieldCheck size={16} />
                <div>
                  <strong>Business Category:</strong>{' '}
                  <span className="capitalized">{formData.business_type}</span>
                </div>
              </div>
              <div className="summary-item">
                <ShoppingCart size={16} />
                <div><strong>Opening Stock:</strong> {Object.keys(selectedProducts).length} items configured</div>
              </div>
            </div>

            <div className="step-actions">
              <button className="onboarding-btn secondary" onClick={prevStep} disabled={loading}>Back</button>
              <button className="onboarding-btn primary success" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Configuring System...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
