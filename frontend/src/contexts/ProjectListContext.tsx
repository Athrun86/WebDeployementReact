import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAtom } from 'jotai';
import { tokenAtom } from '../utils/tokenAtom';
import { requestProjects } from '../api/repository';

export interface Project {
    id: number;
    name: string;
    organizationName?: string;
}

interface ProjectListContextType {
    projects: Project[];
    loading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
}

const ProjectListContext = createContext<ProjectListContextType | undefined>(undefined);

export const useProjectList = () => {
    const context = useContext(ProjectListContext);
    if (!context) {
        throw new Error('useProjectList must be used within a ProjectListProvider');
    }
    return context;
};

interface ProjectListProviderProps {
    children: ReactNode;
}

export const ProjectListProvider: React.FC<ProjectListProviderProps> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tokenAtomValue] = useAtom(tokenAtom);
    const token: string | null = tokenAtomValue ?? null;

    const refreshProjects = async () => {
        if (!token) {
            setLoading(false);
            setError("Token d'authentification requis");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const apiProjects = await requestProjects(token);
            // Mapping pour les composants
            const mapped = apiProjects.map((p: any) => ({
                id: p.id,
                name: p.name,
                organizationName: p.organizationName || p.organisationName
            }));
            setProjects(mapped);
        } catch (e: any) {
            setError(e.message || "Erreur lors du chargement des projets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            refreshProjects();
        }
    }, [token]);

    return (
        <ProjectListContext.Provider value={{
            projects,
            loading,
            error,
            refreshProjects
        }}>
            {children}
        </ProjectListContext.Provider>
    );
};
