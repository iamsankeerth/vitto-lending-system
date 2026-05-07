const API_BASE = import.meta.env.VITE_API_URL || '';

async function api(method, path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle empty responses (e.g. 404 from static host, 502 from proxy)
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!text || !contentType.includes('application/json')) {
    const err = new Error(
      `API call failed: ${res.status} ${res.statusText}. ` +
      `URL: ${url}. ` +
      `Response was not JSON (got: ${text.slice(0, 100) || '[empty body]'}). ` +
      `Make sure VITE_API_URL is set to your backend server.`
    );
    err.code = 'API_ERROR';
    err.status = res.status;
    throw err;
  }

  const data = JSON.parse(text);
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
