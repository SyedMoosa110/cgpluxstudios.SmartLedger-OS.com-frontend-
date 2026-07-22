import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, ShoppingCart, Activity, Monitor, Check, ArrowRight, ShieldCheck, MapPin, DollarSign, Phone, FileText } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function OnboardingWizard({ onComplete, api }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    business_name: '',
    currency_symbol: 'Rs.',
    tagline: '',
    address: '',
    phone: '',
    business_type: '' // pharmacy, supermarket, electronics, general
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectVertical = (type) => {
    setFormData({ ...formData, business_type: type });
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
      const res = await api.post('/onboarding/setup/', formData);
      if (res.data.success) {
        onComplete(res.data);
      } else {
        setError(res.data.detail || 'Failed to complete setup.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during onboarding setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Basics</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Business Line</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Review</div>
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
              <p>We will dynamically morph the database schema and POS layout based on your business line.</p>
            </div>

            <div className="verticals-grid">
              <div
                className={`vertical-card ${formData.business_type === 'pharmacy' ? 'selected' : ''}`}
                onClick={() => handleSelectVertical('pharmacy')}
              >
                <div className="card-icon pharmacy">
                  <Activity size={24} />
                </div>
                <h3>Pharmacy / Medical</h3>
                <p>Activates Expiry Dates, Batch tracking, Rack locations, and 30/60/90 days stock alerts.</p>
              </div>

              <div
                className={`vertical-card ${formData.business_type === 'supermarket' ? 'selected' : ''}`}
                onClick={() => handleSelectVertical('supermarket')}
              >
                <div className="card-icon supermarket">
                  <ShoppingCart size={24} />
                </div>
                <h3>Supermarket / Mart</h3>
                <p>Activates ultra-fast barcode scanning, weighing scales (kg/g/pcs), and multi-buy threshold rules.</p>
              </div>

              <div
                className={`vertical-card ${formData.business_type === 'electronics' ? 'selected' : ''}`}
                onClick={() => handleSelectVertical('electronics')}
              >
                <div className="card-icon electronics">
                  <Monitor size={24} />
                </div>
                <h3>Electronics Store</h3>
                <p>Activates individual IMEI/Serial Number tracking and client/vendor warranty registration.</p>
              </div>

              <div
                className={`vertical-card ${formData.business_type === 'general' ? 'selected' : ''}`}
                onClick={() => handleSelectVertical('general')}
              >
                <div className="card-icon general">
                  <Sparkles size={24} />
                </div>
                <h3>General POS</h3>
                <p>Simple accounting, basic cashbooks, dues, and generic wholesale POS billing.</p>
              </div>
            </div>

            <div className="step-actions">
              <button className="onboarding-btn secondary" onClick={prevStep}>Back</button>
              <button className="onboarding-btn primary" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Finalize */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-header">
              <ShieldCheck size={36} className="header-icon success-icon" />
              <h2>Verify Workspace Setup</h2>
              <p>Ready to compile local assets and establish schema indices.</p>
            </div>

            <div className="review-summary">
              <div className="summary-item">
                <FileText size={16} />
                <div>
                  <strong>Business Name:</strong> {formData.business_name}
                </div>
              </div>
              {formData.tagline && (
                <div className="summary-item">
                  <Sparkles size={16} />
                  <div>
                    <strong>Tagline:</strong> {formData.tagline}
                  </div>
                </div>
              )}
              <div className="summary-item">
                <DollarSign size={16} />
                <div>
                  <strong>Currency Symbol:</strong> {formData.currency_symbol}
                </div>
              </div>
              <div className="summary-item">
                <Phone size={16} />
                <div>
                  <strong>Phone Number:</strong> {formData.phone}
                </div>
              </div>
              <div className="summary-item">
                <MapPin size={16} />
                <div>
                  <strong>Address:</strong> {formData.address || 'Not Provided'}
                </div>
              </div>
              <div className="summary-item highlight">
                <ShieldCheck size={16} />
                <div>
                  <strong>Business Category:</strong>{' '}
                  <span className="capitalized">{formData.business_type}</span>
                </div>
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
