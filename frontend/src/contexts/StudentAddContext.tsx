import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectInfo, createGroup } from '../api/repository';

// ...existing code...

interface Student {
    name: string;
    username: string;
}

interface ProjectInfo {
    title: string;
    organization: string;
    minMembers: number;
    maxMembers: number;
}

interface StudentAddContextType {
    students: Student[];
    projectInfo: ProjectInfo | null;
    maxStudents: number;
    minStudents: number;
    loading: boolean;
    error: string | null;
    handleStudentNameChange: (index: number, value: string) => void;
    handleUsernameChange: (index: number, value: string) => void;
    handleSubmit: () => void;
    projectId: string | undefined;
    securityKey: string | undefined;
}

const StudentAddContext = createContext<StudentAddContextType | undefined>(undefined);

export const useStudentAdd = () => {
    const context = useContext(StudentAddContext);
    if (!context) {
        throw new Error('useStudentAdd must be used within a StudentAddProvider');
    }
    return context;
};

export const StudentAddProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { projectId, securityKey } = useParams<{ projectId: string; securityKey: string }>();
    const [students, setStudents] = useState<Student[]>([{ name: '', username: '' }]);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const maxStudents = projectInfo?.maxMembers;
    if (!maxStudents) {
        throw new Error('Max students information is missing from project info');
    }
    const minStudents = projectInfo?.minMembers ;
    if (!minStudents) {
        throw new Error('Min students information is missing from project info');
    }

    // Fonction pour ajouter une nouvelle ligne d'étudiant
    const addStudentRow = () => {
        if (students.length < maxStudents) {
            setStudents([...students, { name: '', username: '' }]);
        }
    };

    // Fonction pour mettre à jour le nom d'un étudiant
    const handleStudentNameChange = (index: number, value: string) => {
        const updatedStudents = [...students];
        updatedStudents[index].name = value;
        setStudents(updatedStudents);

        // Ajouter automatiquement une nouvelle ligne si la dernière est complétée et on n'a pas atteint le max
        if (index === students.length - 1 && value.trim() !== '' && students.length < maxStudents) {
            const lastStudent = updatedStudents[index];
            if (lastStudent.name.trim() !== '' && lastStudent.username.trim() !== '') {
                addStudentRow();
            }
        }
    };

    // Fonction pour mettre à jour le pseudonyme d'un étudiant
    const handleUsernameChange = (index: number, value: string) => {
        const updatedStudents = [...students];
        updatedStudents[index].username = value;
        setStudents(updatedStudents);

        // Ajouter automatiquement une nouvelle ligne si la dernière est complétée et on n'a pas atteint le max
        if (index === students.length - 1 && value.trim() !== '' && students.length < maxStudents) {
            const lastStudent = updatedStudents[index];
            if (lastStudent.name.trim() !== '' && lastStudent.username.trim() !== '') {
                addStudentRow();
            }
        }
    };

    // Fonction pour valider et soumettre le groupe
    const handleSubmit = async () => {
        const validStudents = students.filter(student =>
            student.name.trim() !== '' && student.username.trim() !== ''
        );

        console.log(`🔍 Submitting group with ${validStudents.length} students`);
        console.log('📋 Valid students:', validStudents);

        if (validStudents.length < minStudents) {
            const message = `Un groupe doit avoir au minimum ${minStudents} étudiants.`;
            console.log(`❌ Validation failed: ${message}`);
            alert(message);
            return;
        }

        if (!projectId || !securityKey) {
            console.log('❌ Missing project information');
            alert('Informations du projet manquantes');
            return;
        }

        try {
            setLoading(true);
            console.log(`🚀 Creating group for project ${projectId} with security key ${securityKey}`);

            const result = await createGroup(projectId, securityKey, validStudents);

            console.log('📄 Group creation result:', result);

            if (result.success) {
                console.log('✅ Group created successfully!');
                alert('Groupe créé avec succès !');
                // Reset form
                setStudents([{ name: '', username: '' }]);
            } else {
                console.log(`❌ Group creation failed: ${result.message}`);
                alert(`Erreur : ${result.message}`);
            }
        } catch (error: any) {
            console.error('❌ Error during group creation:', error);
            alert('Erreur lors de la création du groupe');
        } finally {
            setLoading(false);
        }
    };

    // Récupération des informations du projet
    useEffect(() => {
        const fetchProjectInfo = async () => {
            if (projectId && securityKey) {
                try {
                    setLoading(true);
                    setError(null);

                    console.log('🔍 StudentAddContext: Fetching project info...');
                    console.log(`📋 Project ID: ${projectId}`);
                    console.log(`📋 Security Key: ${securityKey}`);
                    console.log(`📋 API URL: ${import.meta.env.VITE_API_URL}`);
                    console.log(`📋 Full URL: ${import.meta.env.VITE_API_URL}/groups/project/${projectId}/${securityKey}`);

                    const result = await getProjectInfo(projectId, securityKey);

                    console.log('📄 API Result received:', result);

                    if (result.isValid && result.data) {
                        console.log('✅ Valid project data received');
                        setProjectInfo({
                            title: result.data.title,
                            organization: result.data.organization,
                            minMembers: result.data.minMembers,
                            maxMembers: result.data.maxMembers,
                        });
                        console.log(`📊 Project: ${result.data.title} (${result.data.organization})`);
                    } else {
                        const errorMessage = result.message || "Accès non autorisé";
                        console.log(`❌ Invalid project response: ${errorMessage}`);
                        setProjectInfo({
                            title: "Projet invalide",
                            organization: errorMessage,
                            minMembers: 0,
                            maxMembers: 0
                        });
                        setError(errorMessage);
                    }
                } catch (error: any) {
                    console.error('❌ Error in fetchProjectInfo:', error);

                    let errorMessage = "Impossible de récupérer les informations du projet";

                    // More specific error messages based on error type
                    if (error.code === 'ECONNREFUSED') {
                        errorMessage = "Serveur backend non accessible (connexion refusée)";
                        console.log('🔍 Diagnostic: Le serveur backend n\'est probablement pas démarré sur le port 3000');
                    } else if (error.message && error.message.includes('Network Error')) {
                        errorMessage = "Erreur réseau - Vérifiez que le serveur backend est démarré";
                        console.log('🔍 Diagnostic: Erreur réseau, serveur backend probablement arrêté');
                    } else if (error.response) {
                        errorMessage = `Erreur serveur (${error.response.status}): ${error.response.statusText}`;
                        console.log(`🔍 Diagnostic: Serveur accessible mais erreur ${error.response.status}`);
                        if (error.response.data) {
                            console.log('📄 Response data:', error.response.data);
                        }
                    } else {
                        console.log('🔍 Diagnostic: Erreur inconnue:', error.message);
                    }

                    setProjectInfo({
                        title: "Erreur de connexion",
                        organization: errorMessage,
                        minMembers: 0,
                        maxMembers: 0
                    });
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log('❌ Missing project parameters in URL');
                setError("Informations de projet manquantes dans l'URL");
                setLoading(false);
            }
        };

        fetchProjectInfo();
    }, [projectId, securityKey]);

    const value: StudentAddContextType = {
        students,
        projectInfo,
        maxStudents: maxStudents,
        minStudents: minStudents,
        loading,
        error,
        handleStudentNameChange,
        handleUsernameChange,
        handleSubmit,
        projectId,
        securityKey
    };

    return (
        <StudentAddContext.Provider value={value}>
            {children}
        </StudentAddContext.Provider>
    );
};
