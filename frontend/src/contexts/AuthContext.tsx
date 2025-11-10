import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { tokenAtom } from '../utils/tokenAtom';
import { login } from '../api/repository';

interface AuthContextType {
    handleLogin: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [, setToken] = useAtom(tokenAtom);
    const navigate = useNavigate();

    const handleLogin = async (username: string, password: string) => {
        try {
            const response = await login(username, password);
            if (response.token) {
                setToken(response.token);
                navigate('/projects');
            } else {
                const msg = response.message || 'Authenticate error';
                alert('Login failed: ' + msg);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Login error';
            alert('Login error: ' + errorMessage);
        }
    };

    const value: AuthContextType = {
        handleLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
