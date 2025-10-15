
import "../style/_shared.scss"



const ProjectForm = () => {

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
                <div className="login-center">
                    <div className="login-container">
                        <form>
                            <label htmlFor="ProjectName">Project Name</label>
                             <input
                                    id="ProjectName"
                                    type="text"
                                    placeholder="Enter the project name"
                                    autoComplete="off"
                            />
                            <div className="member-row">
                                <label htmlFor="MinMemberCount">Member</label>
                                 <input
                                    id="MinMemberCount"
                                    type="number"
                                    placeholder="min"
                                    autoComplete="off"

                                 />
                                <input
                                    id="MaxMemberCount"
                                    type="number"
                                    placeholder="max"
                                    autoComplete="off"

                                />
                            </div>
                                <label htmlFor="GroupsCreated">Groupe déja crées</label>
                                    <input
                                        id="GroupsCreated"
                                        type="text"
                                        disabled= {true}
                                        autoComplete="off"
                                    />
                        </form>
                        </div>
                    </div>
        </div>
    );
}
export default ProjectForm;