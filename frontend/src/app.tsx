// typescript
// File: `frontend/src/app.tsx`


import LoginForm from './Pages/loginForm.tsx';
import ProjectListPage from './Pages/projectListPage.tsx';
import ProjectForm from './Pages/projectForm.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudentAdd from './Pages/studentAdd.tsx';
import { useAtom } from 'jotai';
import { tokenAtom } from "./utils/tokenAtom.ts";
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { ProjectListProvider } from './contexts/ProjectListContext.tsx';
import { ProjectFormProvider } from './contexts/ProjectFormContext.tsx';
import { StudentAddProvider } from './contexts/StudentAddContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

function AppContent() {
    const [token] = useAtom(tokenAtom);

    // Vérification automatique du token et gestion de l'expiration
    useAuthRedirect();

    return (
        <Routes>
            {/* Route de debug temporaire */}

            {/* Route publique pour l'ajout d'étudiants - accessible sans token */}
            <Route
                path="/studentAdd/:projectId/:securityKey"
                element={
                    <StudentAddProvider>
                        <StudentAdd />
                    </StudentAddProvider>
                }
            />

            {/* Routes authentifiées */}
            {token ? (
                <>
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
                </>
            ) : (
                /* Routes non authentifiées - afficher le login pour toutes les autres routes */
                <Route path="*" element={
                    <AuthProvider>
                        <LoginForm />
                    </AuthProvider>
                } />
            )}
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
