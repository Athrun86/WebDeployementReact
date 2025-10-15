import  {useState } from "react";
import ProjectTemplate from "./ProjectTemplate.tsx";
import "../style/_shared.scss";
import {useNavigate} from "react-router-dom";


const ProjectListPage = () => {
    const [projects] = useState([
        {id: 1, title: "Project Alpha", groupNumber: 1, description: "Description for Project Alpha"},
        {id: 2, title: "Project Beta", groupNumber: 2, description: "Description for Project Beta"},
        {id: 3, title: "Project Gamma", groupNumber: 1, description: "Description for Project Gamma"},
    ]);
    const navigate = useNavigate();
    const handleEdit = (id: number) => {
      alert('Modify project with ID: ' + id);
    };
    const handleAddProject = () => {
         navigate('/CreateProject');
    }
return (
    <div className="general-bg brushed-metal">
        <div className="glow-effect"></div>
<ProjectTemplate
    projects={projects}
    title="Project List"
    onEdit={handleEdit}
/>
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