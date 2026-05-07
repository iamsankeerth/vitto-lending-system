export function success(data, meta = {}) {
  return { data, meta };
}

export function error(err, meta = {}) {
  return {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || null,
    },
    meta,
  };
}