import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rankarena_token');
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('rankarena_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await client.post('/auth/login', { email, password });
    localStorage.setItem('rankarena_token', res.data.token);
    const me = await client.get('/users/me');
    setUser(me.data);
    return me.data;
  }

  async function signup(payload) {
    const res = await client.post('/auth/signup', payload);
    localStorage.setItem('rankarena_token', res.data.token);
    const me = await client.get('/users/me');
    setUser(me.data);
    return me.data;
  }

  function logout() {
    localStorage.removeItem('rankarena_token');
    setUser(null);
  }

  async function refresh() {
    const me = await client.get('/users/me');
    setUser(me.data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
