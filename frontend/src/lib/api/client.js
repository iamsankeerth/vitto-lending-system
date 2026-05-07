const API_BASE = import.meta.env.VITE_API_URL || '';

async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message || 'Request failed');
    err.code = data.error?.code || 'ERROR';
    err.details = data.error?.details || null;
    err.status = res.status;
    throw err;
  }
  return data.data;
}

export const apiClient = {
  createBusinessProfile: (dto) => api('POST', '/api/business-profiles', dto),
  createLoanApplication: (dto) => api('POST', '/api/loan-applications', dto),
  evaluateDecision: (id) => api('POST', `/api/loan-applications/${id}/decision`, {}),
  getApplicationDetails: (id) => api('GET', `/api/loan-applications/${id}`),
};
