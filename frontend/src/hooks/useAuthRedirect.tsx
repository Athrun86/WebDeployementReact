import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { tokenAtom } from '../utils/tokenAtom';
import { isTokenExpired, getTokenExpMs } from '../utils/jwt';

export function useAuthRedirect() {
  const [token, setToken] = useAtom(tokenAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (isTokenExpired(token)) {
      setToken(null);
      navigate('/login', { replace: true });
      return;
    }
    const expMs = getTokenExpMs(token);
    if (!expMs) return;
    const msUntilExpiry = expMs - Date.now();
    const timer = setTimeout(() => {
      setToken(null);
      navigate('/login', { replace: true });
    }, Math.max(msUntilExpiry, 0));
    return () => clearTimeout(timer);
  }, [token, setToken, navigate]);
}

