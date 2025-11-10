import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectInfo, createGroup } from '../api/repository';

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

    const maxStudents = projectInfo?.maxMembers ?? 0;
    const minStudents = projectInfo?.minMembers ?? 0;

    // Validation des valeurs de configuration
    useEffect(() => {
        if (projectInfo) {
            if (projectInfo.maxMembers <= 0 || projectInfo.minMembers <= 0) {
                setError("Configuration du projet invalide : nombre de membres incorrect");
                return;
            }
            if (projectInfo.maxMembers < projectInfo.minMembers) {
                setError("Configuration du projet invalide : maximum inférieur au minimum");
                return;
            }
            // Réinitialiser l'erreur si tout va bien
            if (error && error.includes("Configuration du projet invalide")) {
                setError(null);
            }
        }
    }, [projectInfo]);

    // Fonction pour ajouter une nouvelle ligne d'étudiant
    const addStudentRow = () => {
        if (maxStudents > 0 && students.length < maxStudents) {
            setStudents([...students, { name: '', username: '' }]);
        }
    };

    const handleStudentNameChange = (index: number, value: string) => {
        if (maxStudents <= 0) return;

        const updatedStudents = [...students];
        updatedStudents[index].name = value;
        setStudents(updatedStudents);

        if (index === students.length - 1 && value.trim() !== '' && students.length < maxStudents) {
            const lastStudent = updatedStudents[index];
            if (lastStudent.name.trim() !== '' && lastStudent.username.trim() !== '') {
                addStudentRow();
            }
        }
    };

    const handleUsernameChange = (index: number, value: string) => {
        if (maxStudents <= 0) return;

        const updatedStudents = [...students];
        updatedStudents[index].username = value;
        setStudents(updatedStudents);

        if (index === students.length - 1 && value.trim() !== '' && students.length < maxStudents) {
            const lastStudent = updatedStudents[index];
            if (lastStudent.name.trim() !== '' && lastStudent.username.trim() !== '') {
                addStudentRow();
            }
        }
    };

    const handleSubmit = async () => {
        if (minStudents <= 0 || maxStudents <= 0) {
            alert('Configuration du projet non chargée. Veuillez rafraîchir la page.');
            return;
        }

        const validStudents = students.filter(student =>
            student.name.trim() !== '' && student.username.trim() !== ''
        );

        if (validStudents.length < minStudents) {
            alert(`Un groupe doit avoir au minimum ${minStudents} étudiants.`);
            return;
        }

        if (validStudents.length > maxStudents) {
            alert(`Un groupe ne peut pas avoir plus de ${maxStudents} étudiants.`);
            return;
        }

        if (!projectId || !securityKey) {
            alert('Informations du projet manquantes');
            return;
        }

        try {
            setLoading(true);
            const result = await createGroup(projectId, securityKey, validStudents);

            if (result.success) {
                alert('Groupe créé avec succès !');
                setStudents([{ name: '', username: '' }]);
            } else {
                alert(result.message || 'Erreur lors de la création du groupe');
            }
        } catch (error: any) {
            alert('Erreur lors de la création du groupe');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProjectInfo = async () => {
            if (projectId && securityKey) {
                try {
                    const result = await getProjectInfo(projectId, securityKey);

                    if (result.isValid && result.data) {
                        setProjectInfo({
                            title: result.data.title,
                            organization: result.data.organization,
                            minMembers: result.data.minMembers,
                            maxMembers: result.data.maxMembers,
                        });
                        setError(null);
                    } else {
                        setError(result.message || "Accès non autorisé");
                    }
                } catch (error: any) {
                    setError('Erreur lors du chargement des informations du projet');
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Informations de projet manquantes dans l'URL");
                setLoading(false);
            }
        };

        fetchProjectInfo();
    }, [projectId, securityKey]);

    const value: StudentAddContextType = {
        students,
        projectInfo,
        maxStudents,
        minStudents,
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
