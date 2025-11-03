import { useEffect, useState } from "react";
import ProjectTemplate from "../Components/projectTemplate.tsx";
import "../style/_shared.scss";
import { useNavigate } from "react-router-dom";
import { requestProjects } from "../api/repository.ts";
import { useAtom } from "jotai";
import { tokenAtom } from "../utils/tokenAtom.ts";


const ProjectListPage = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tokenAtomValue] = useAtom(tokenAtom);
    const token: string | null = tokenAtomValue ?? null;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) throw new Error("Token manquant");
                const apiProjects = await requestProjects(token);
                // Mapping pour ProjectTemplate
                const mapped = apiProjects.map((p: any) => ({
                    id: p.id,
                    title: p.name,
                    groupNumber: 1, // à adapter si besoin
                    description: p.organizationName // organisation GitHub
                }));
                setProjects(mapped);
            } catch (e: any) {
                setError(e.message || "Erreur lors du chargement des projets");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [token]);

    const handleEdit = (id: number) => {
        alert('Modify project with ID: ' + id);
    };
    const handleAddProject = () => {
        navigate('/CreateProject');
    };

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            {loading ? (
                <div style={{textAlign: 'center', margin: '2rem'}}>Chargement...</div>
            ) : error ? (
                <div style={{color: 'red', textAlign: 'center', margin: '2rem'}}>{error}</div>
            ) : (
                <ProjectTemplate
                    projects={projects}
                    title="Project List"
                    onEdit={handleEdit}
                />
            )}
            <div style={{display: "flex", justifyContent: "flex-end", maxWidth: 400, margin: "2rem auto 0"}}>
                <button
                    type="submit"
                    onClick={handleAddProject}
                    style={{width: "100%", maxWidth:370}}>
                    Ajouter un projet
                </button>
            </div>
        </div>
    );
};
export default ProjectListPage;