const TOKEN_KEY = "pmgps_token";

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers = { ...authHeaders(), ...options.headers };
  return fetch(url, { ...options, headers });
};
