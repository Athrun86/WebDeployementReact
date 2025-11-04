
import ProjectTemplate from "../Components/projectTemplate.tsx";
import "../style/_shared.scss";
import { useNavigate } from "react-router-dom";
import { useProjectList } from "../contexts/ProjectListContext.tsx";

const ProjectListPage = () => {
    const { projects, loading, error } = useProjectList();
    const navigate = useNavigate();

    const handleEdit = (id: number) => {
        navigate(`/editProject/${id}`);
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