import React, { useState } from 'react';
import { apiClient } from '../../lib/api/client.js';
import { validateForm } from '../../lib/validation/pan.js';

const BUSINESS_TYPES = ['retail', 'manufacturing', 'services', 'wholesale', 'other'];
const PURPOSES = ['working_capital', 'equipment_purchase', 'expansion', 'inventory', 'other'];

export default function ApplicationForm({ onResult }) {
  const [values, setValues] = useState({
    ownerName: '',
    pan: '',
    businessType: '',
    monthlyRevenueRupees: '',
    requestedAmountRupees: '',
    tenureMonths: '',
    purpose: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
    setServerError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const profile = await apiClient.createBusinessProfile({
        ownerName: values.ownerName,
        pan: values.pan.trim().toUpperCase(),
        businessType: values.businessType,
        monthlyRevenueRupees: Number(values.monthlyRevenueRupees),
      });

      const application = await apiClient.createLoanApplication({
        businessProfileId: profile.id,
        requestedAmountRupees: Number(values.requestedAmountRupees),
        tenureMonths: Number(values.tenureMonths),
        purpose: values.purpose,
      });

      const decision = await apiClient.evaluateDecision(application.id);

      onResult({ profile, application, decision });
    } catch (err) {
      setServerError(err.details ? Object.entries(err.details).map(([k, v]) => `${k}: ${v}`).join('; ') : err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setValues({
      ownerName: '',
      pan: '',
      businessType: '',
      monthlyRevenueRupees: '',
      requestedAmountRupees: '',
      tenureMonths: '',
      purpose: '',
    });
    setErrors({});
    setServerError(null);
    onResult(null);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h2>Business Profile</h2>
        <div className="form-grid">
          <div className="field">
            <label>Owner Name</label>
            <input name="ownerName" value={values.ownerName} onChange={handleChange} placeholder="Amit Sharma" />
            {errors.ownerName && <span className="error">{errors.ownerName}</span>}
          </div>
          <div className="field">
            <label>PAN Number</label>
            <input name="pan" value={values.pan} onChange={handleChange} placeholder="ABCDE1234F" />
            {errors.pan && <span className="error">{errors.pan}</span>}
          </div>
          <div className="field">
            <label>Business Type</label>
            <select name="businessType" value={values.businessType} onChange={handleChange}>
              <option value="">Select type</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.businessType && <span className="error">{errors.businessType}</span>}
          </div>
          <div className="field">
            <label>Monthly Revenue (₹)</label>
            <input name="monthlyRevenueRupees" type="number" value={values.monthlyRevenueRupees} onChange={handleChange} placeholder="250000" />
            {errors.monthlyRevenueRupees && <span className="error">{errors.monthlyRevenueRupees}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Loan Application</h2>
        <div className="form-grid">
          <div className="field">
            <label>Loan Amount (₹)</label>
            <input name="requestedAmountRupees" type="number" value={values.requestedAmountRupees} onChange={handleChange} placeholder="800000" />
            {errors.requestedAmountRupees && <span className="error">{errors.requestedAmountRupees}</span>}
          </div>
          <div className="field">
            <label>Tenure (months)</label>
            <input name="tenureMonths" type="number" min={3} max={60} value={values.tenureMonths} onChange={handleChange} placeholder="18" />
            {errors.tenureMonths && <span className="error">{errors.tenureMonths}</span>}
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Purpose</label>
            <select name="purpose" value={values.purpose} onChange={handleChange}>
              <option value="">Select purpose</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
            {errors.purpose && <span className="error">{errors.purpose}</span>}
          </div>
        </div>
      </div>

      {serverError && <div className="alert">{serverError}</div>}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Submit Application'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
          Reset
        </button>
      </div>
    </form>
  );
}
