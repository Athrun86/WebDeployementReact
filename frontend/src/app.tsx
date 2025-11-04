// typescript
// File: `frontend/src/app.tsx`


import axios from 'axios';
import LoginForm from './Pages/loginForm.tsx';
import ProjectListPage from './Pages/projectListPage.tsx';
import ProjectForm from './Pages/projectForm.tsx';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import StudentAdd from './Pages/studentAdd.tsx';
import { useAtom } from 'jotai';
import {tokenAtom} from "./utils/tokenAtom.ts";
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { ProjectListProvider } from './contexts/ProjectListContext.tsx';
import { ProjectFormProvider } from './contexts/ProjectFormContext.tsx';


function AppContent() {
    const [token, setToken] = useAtom(tokenAtom);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    // Vérification automatique du token et redirection
    useAuthRedirect();

    // Suppression de la logique validateToken, on s'appuie sur le hook

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

    if (!token) {
        return <LoginForm onLogin={handleLogin} />;
    }

    return (
        <Routes>
            <Route path="/" element={
                <ProjectListProvider>
                    <ProjectListPage />
                </ProjectListProvider>
            } />
            <Route path="/projects" element={
                <ProjectListProvider>
                    <ProjectListPage />
                </ProjectListProvider>
            } />
            <Route path="/CreateProject" element={
                <ProjectFormProvider>
                    <ProjectForm />
                </ProjectFormProvider>
            } />
            <Route path="/editProject/:id" element={
                <ProjectFormProvider>
                    <ProjectForm />
                </ProjectFormProvider>
            } />
            <Route path="/AddStudent/:projectId/:securityKey" element={<StudentAdd />} />
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
