import React from "react";
import "../style/_shared.scss"
import "../style/projectTemplate.scss"
type Project = {
    id: number;
    name: string;
    organisationName?: string;
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
                    <h2>{project.name}</h2>
                    {project.organisationName && <p>{project.organisationName}</p>}
                </div>
            ))}
                </div>
    </div>
);
export default ProjectTemplate;
