const normalizeApiBase = (url) => {
  if (!url) return '';
  const trimmedUrl = url.replace(/\/+$/, '');
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

const resolveApiBase = () => {
  const configured = import.meta.env.VITE_API_URL;
  const value = typeof configured === 'string' ? configured.trim() : '';
  if (value) {
    return normalizeApiBase(value);
  }
  return '/api';
};

export { normalizeApiBase, resolveApiBase };
