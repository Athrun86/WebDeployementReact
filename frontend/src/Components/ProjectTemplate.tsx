import React from "react";
import "../style/_shared.scss"
import "../style/ProjectTemplate.scss"
type Project = {
    id: number;
    title: string;
    groupNumber: number;
    description?: string;
};
type Props = {
    projects: Project[];
    title?: string;
    onEdit?: (id: number) => void;

}


const ProjectTemplate: React.FC<Props> = ({
    projects,
    title,
    onEdit
}) =>
    (
    <div className="project-center"  >
        {title && <h1 className="project-title">{title}</h1>}
        <div className="project-list" >
            {projects.map((project) => (
                <div className="project-item" onClick={onEdit ? () => onEdit(project.id) : undefined}  key={project.id}>
                    <h2>{project.title}</h2>
                    {project.description && <p>{project.description}</p>}
                </div>
            ))}
                </div>
    </div>
);
export default ProjectTemplate;
