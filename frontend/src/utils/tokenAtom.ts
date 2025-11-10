
import { atomWithStorage } from 'jotai/utils';

// Utilise atomWithStorage pour persister le token dans localStorage
export const tokenAtom = atomWithStorage<string | null>('auth-token', null);
