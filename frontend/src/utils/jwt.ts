// Utilitaires pour décoder et vérifier l'expiration d'un JWT
export function getTokenExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return null;
    return payload.exp * 1000; // ms
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpMs(token);
  if (!exp) return true;
  return Date.now() >= exp;
}

