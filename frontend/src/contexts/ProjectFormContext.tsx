import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAtom } from 'jotai';
import { tokenAtom } from '../utils/tokenAtom';
import {
    requestOrganizations,
    requestNextProjectId,
    createProject,
    getProjectById,
    updateProject
} from '../api/repository';

export interface Organization {
    id: number;
    login: string;
    avatar_url: string;
    url: string;
}

export interface ProjectFormData {
    projectName: string;
    minMembers?: number;
    maxMembers?: number;
    selectedOrganizationId?: number;
    securityKey: string;
}

interface ProjectFormContextType {
    // Data
    organizations: Organization[];
    nextProjectId: number | null;
    projectFormData: ProjectFormData;
    projectLoaded: any | null;

    // States
    loading: boolean;
    error: string | null;

    // Actions
    setProjectFormData: (data: Partial<ProjectFormData>) => void;
    loadProjectForEdit: (id: number) => Promise<void>;
    submitProject: (editId?: string) => Promise<void>;
    generateInviteLink: (editId?: string) => string;
    resetForm: () => void;
}

const ProjectFormContext = createContext<ProjectFormContextType | undefined>(undefined);

export const useProjectForm = () => {
    const context = useContext(ProjectFormContext);
    if (!context) {
        throw new Error('useProjectForm must be used within a ProjectFormProvider');
    }
    return context;
};

function generateSecurityKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

interface ProjectFormProviderProps {
    children: ReactNode;
}

export const ProjectFormProvider: React.FC<ProjectFormProviderProps> = ({ children }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [nextProjectId, setNextProjectId] = useState<number | null>(null);
    const [projectLoaded, setProjectLoaded] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenAtomValue] = useAtom(tokenAtom);
    const token: string | null = tokenAtomValue ?? null;

    const [projectFormData, setProjectFormDataState] = useState<ProjectFormData>({
        projectName: '',
        minMembers: undefined,
        maxMembers: undefined,
        selectedOrganizationId: undefined,
        securityKey: generateSecurityKey()
    });

    const setProjectFormData = (data: Partial<ProjectFormData>) => {
        setProjectFormDataState(prev => ({ ...prev, ...data }));
    };

    const resetForm = () => {
        setProjectFormDataState({
            projectName: '',
            minMembers: undefined,
            maxMembers: undefined,
            selectedOrganizationId: undefined,
            securityKey: generateSecurityKey()
        });
        setProjectLoaded(null);
        setError(null);
    };

    // Chargement initial des organisations et nextId
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const [orgs, id] = await Promise.all([
                    requestOrganizations(token),
                    requestNextProjectId(token)
                ]);
                setOrganizations(orgs);
                setNextProjectId(id);
            } catch (e) {
                console.error("Erreur lors du chargement des données:", e);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    // Synchronisation de l'organisation sélectionnée après chargement
    useEffect(() => {
        if (projectLoaded && organizations.length > 0) {
            const org = organizations.find(o => o.login === projectLoaded.organizationName);
            if (org) {
                setProjectFormData({ selectedOrganizationId: org.id });
            }
        }
    }, [projectLoaded, organizations]);

    const loadProjectForEdit = async (id: number) => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const project = await getProjectById(id, token);
            setProjectLoaded(project);
            setProjectFormData({
                projectName: project.name,
                minMembers: project.minMembers,
                maxMembers: project.maxMembers,
                securityKey: project.securityKey
            });
        } catch (e: any) {
            setError(e.message || "Erreur lors du chargement du projet à modifier.");
        } finally {
            setLoading(false);
        }
    };

    const submitProject = async (editId?: string) => {
        if (!token) {
            setError("Token d'authentification manquant. Veuillez vous reconnecter.");
            return;
        }

        const { projectName, selectedOrganizationId, minMembers, maxMembers, securityKey } = projectFormData;

        if (!securityKey || !projectName || !selectedOrganizationId || minMembers === undefined || maxMembers === undefined) {
            setError("Tous les champs sont obligatoires.");
            return;
        }

        if (!Number.isInteger(minMembers) || minMembers < 1) {
            setError("Le nombre minimum de membres doit être un entier positif (>= 1).");
            return;
        }

        if (!Number.isInteger(maxMembers) || maxMembers < 1) {
            setError("Le nombre maximum de membres doit être un entier positif (>= 1).");
            return;
        }

        if (maxMembers < minMembers) {
            setError("Le nombre maximum de membres doit être supérieur ou égal au minimum.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const selectedOrg = organizations.find(o => o.id === selectedOrganizationId);
            const projectData = {
                name: projectName,
                organizationName: selectedOrg?.login || '',
                githubUrl: selectedOrg?.url || '',
                minMembers,
                maxMembers,
                securityKey
            };

            if (editId) {
                await updateProject(Number(editId), projectData, token);
            } else {
                await createProject({
                    id: nextProjectId,
                    ...projectData
                }, token);
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création ou modification du projet.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generateInviteLink = (editId?: string): string => {
        const baseUrl = import.meta.env.MODE === 'production'
            ? `${window.location.origin}/WebDeployementReact/#`
            : `${window.location.origin}/#`;

        if (editId && projectLoaded) {
            return `${baseUrl}/studentAdd/${projectLoaded.id}/${projectLoaded.securityKey}`;
        } else if (nextProjectId) {
            return `${baseUrl}/studentAdd/${nextProjectId}/${projectFormData.securityKey}`;
        }
        return '';
    };


    return (
        <ProjectFormContext.Provider value={{
            organizations,
            nextProjectId,
            projectFormData,
            projectLoaded,
            loading,
            error,
            setProjectFormData,
            loadProjectForEdit,
            submitProject,
            generateInviteLink,
            resetForm
        }}>
            {children}
        </ProjectFormContext.Provider>
    );
};
