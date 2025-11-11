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

/**
 * Main application content component.
 * Handles routing and conditional rendering based on authentication state.
 */
function AppContent() {
    // Retrieve the authentication token using Jotai's atom state management
    const [token] = useAtom(tokenAtom);


    // Automatically checks the token and redirects if expired or invalid
    useAuthRedirect();

    return (
        <Routes>
            {/* Public route for adding students - accessible without authentication */}
            <Route
                path="/studentAdd/:projectId/:securityKey"
                element={
                    <StudentAddProvider>
                        <StudentAdd />
                    </StudentAddProvider>
                }
            />

            {/* Authenticated routes */}
            {token ? (
                <>
                    {/* Route for the project list page */}
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
                    {/* Route for creating a new project */}
                    <Route path="/CreateProject" element={
                        <ProjectFormProvider>
                            <ProjectForm />
                        </ProjectFormProvider>
                    } />
                    {/* Route for editing an existing project */}
                    <Route path="/editProject/:id" element={
                        <ProjectFormProvider>
                            <ProjectForm />
                        </ProjectFormProvider>
                    } />
                </>
            ) : (
                // Non-authenticated routes - redirects to the login form for all other paths
                <Route path="*" element={
                    <AuthProvider>
                        <LoginForm />
                    </AuthProvider>
                } />
            )}
        </Routes>
    );
}

/**
 * Main application component.
 * Wraps the application content with the `BrowserRouter` for routing.
 */
export default function App() {
    const basename = import.meta.env.MODE === 'production' ? '/WebDeployementReact' : '';
    return (
        <BrowserRouter basename={basename}>
            <AppContent />
        </BrowserRouter>
    );
}