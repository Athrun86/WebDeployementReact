
// typescript
// File: `frontend/src/app.tsx`
import { useEffect } from 'react';

import axios from 'axios';
import LoginForm from './Pages/loginForm.tsx';
import ProjectListPage from './Pages/projectListPage.tsx';
import ProjectForm from './Pages/projectForm.tsx';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import StudentAdd from './Pages/studentAdd.tsx';
import { useAtom } from 'jotai';
import {tokenAtom} from "./utils/tokenAtom.ts";
import  { requestvalidationToken } from "./api/repository.ts";


function AppContent() {
    const [token, setToken] = useAtom(tokenAtom);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;
    async function validateToken() {
        if (!token) return;
        try {
            const isValid = await requestvalidationToken(token);
           if (!isValid) {
                setToken(null);
                navigate('/login');
           }
           else {
                navigate('/projects');
           }
        }
        catch (err) {
            setToken(null);
            navigate('/login');
        }
    }
    useEffect(() => {
        validateToken();
    }, [token]);




    async function handleLogin(username: string, password: string) {
        try {
            const resp = await axios.post(`${apiUrl}/login`, { username, password });
            if (resp.status === 200) {
                const raw = resp.data?.token;
                setToken(raw);
                navigate('/projects');
            } else {
                const msg = resp.data?.message || resp.statusText || 'Authenticate error';
                alert('login failed: ' + msg);
            }
        } catch (err) {
            alert('login error: ' + err);
        }
    }

    if (!validateToken()) {
        return <LoginForm onLogin={handleLogin} />;
    }

    return (
        <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/CreateProject" element={<ProjectForm />} />
            <Route path="/AddStudent" element={<StudentAdd />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
