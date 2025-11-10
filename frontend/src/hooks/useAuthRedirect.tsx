import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useLocation} from 'react-router-dom';
import { tokenAtom } from '../utils/tokenAtom';
import { isTokenExpired, getTokenExpMs } from '../utils/jwt';

export function useAuthRedirect() {
  const [token, setToken] = useAtom(tokenAtom);

  const location = useLocation();

  useEffect(() => {
    // Routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = ['/AddStudent'];
    const isPublicRoute = publicRoutes.some(route =>
      location.pathname.startsWith(route)
    );

    // Si on est sur une route publique, ne pas faire de redirection
    if (isPublicRoute) {
      return;
    }

    // Si pas de token, rediriger vers la page de login (pas de route spécifique)
    if (!token) {
      // Ne pas rediriger, laisser App.tsx gérer cela avec la logique existante
      return;
    }

    // Si le token est expiré, le supprimer
    if (isTokenExpired(token)) {
      setToken(null);
      return;
    }

    // Programmer l'expiration automatique du token
    const expMs = getTokenExpMs(token);
    if (!expMs) return;

    const msUntilExpiry = expMs - Date.now();
    const timer = setTimeout(() => {
      setToken(null);
    }, Math.max(msUntilExpiry, 0));

    return () => clearTimeout(timer);
  }, [token, setToken, location.pathname]);
}

