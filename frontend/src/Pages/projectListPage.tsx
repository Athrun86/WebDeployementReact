import ProjectTemplate from "../Components/projectTemplate.tsx";
        import "../style/_shared.scss";
        import { useNavigate } from "react-router-dom";
        import { useProjectList } from "../contexts/ProjectListContext.tsx";

        /**
         * Page component for displaying a list of projects.
         * Allows users to view, edit, and add projects.
         *
         * @component
         */
        const ProjectListPage = () => {
            // Retrieve the list of projects, loading state, and error message from the ProjectList context
            const { projects, loading, error } = useProjectList();
            const navigate = useNavigate();

            /**
             * Handles navigation to the edit project page for a specific project.
             *
             * @param {number} id - The ID of the project to edit.
             */
            const handleEdit = (id: number) => {
                navigate(`/editProject/${id}`);
            };

            /**
             * Handles navigation to the create project page.
             */
            const handleAddProject = () => {
                navigate('/CreateProject');
            };

            return (
                <div className="general-bg brushed-metal">
                    <div className="glow-effect"></div>
                    {loading ? (
                        // Display a loading message while projects are being fetched
                        <div style={{textAlign: 'center', margin: '2rem'}}>Chargement...</div>
                    ) : error ? (
                        // Display an error message if there is an issue fetching projects
                        <div style={{color: 'red', textAlign: 'center', margin: '2rem'}}>{error}</div>
                    ) : (
                        // Render the list of projects using the ProjectTemplate component
                        <ProjectTemplate
                            projects={projects}
                            title="Project List"
                            onEdit={handleEdit}
                        />
                    )}
                    {/* Button to navigate to the create project page */}
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