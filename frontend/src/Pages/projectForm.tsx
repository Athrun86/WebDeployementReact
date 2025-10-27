// typescript
// File: `frontend/src/Components/projectForm.tsx`
import {useEffect, useState} from "react";
import "../style/_shared.scss";
import "../style/projectForm.scss";
import CopyButton from "../Components/copyButton.tsx";
import {requestOrganisations} from "../api/repository.ts";
import {useAtom} from "jotai";
import {tokenAtom} from "../utils/tokenAtom.ts";





const ProjectForm = () => {
    const [projectName, setProjectName] = useState('');
    const [minMembers, setMinMembers] = useState<number | undefined>();
    const [maxMembers, setMaxMembers] = useState<number | undefined>();
    const [token] = useAtom(tokenAtom);


    useEffect(() => {
        const fetchOrganisations = async () => {
            try {
                console.log("Fetch Organisations");
                if (!token) return;
                const orgs = await requestOrganisations(token);
                console.log('Fetched organisations:', orgs);
            }
            catch (e){
                console.error('Error fetching organisations:', e);
            }
        }
        fetchOrganisations();
    }, []);

    const inviteLink = `${window.location.origin}/add-student?project=`;





    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            <div className="login-center">
                <div className="project-form-container">
                    <form>
                        <div className="project-form-input-row">
                            <label htmlFor="ProjectName">Nom du projet</label>
                            <input
                                id="ProjectName"
                                type="text"
                                placeholder="Entrez le nom du projet"
                                autoComplete="off"
                                value={projectName}
                                onChange={e => setProjectName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="project-form-input-row">
                            <label htmlFor="OrganisationSelect">Organisation</label>

                        </div>
                        <div className="member-row">
                            <label htmlFor="MinMemberCount">Membres</label>
                            <input
                                id="MinMemberCount"
                                type="number"
                                placeholder="min"
                                autoComplete="off"
                                value={minMembers ?? ''}
                                onChange={e => setMinMembers(e.target.value ? Number(e.target.value) : undefined)}
                                min={1}
                            />
                            <input
                                id="MaxMemberCount"
                                type="number"
                                placeholder="max"
                                autoComplete="off"
                                value={maxMembers ?? ''}
                                onChange={e => setMaxMembers(e.target.value ? Number(e.target.value) : undefined)}
                                min={1}
                            />
                        </div>
                        {/* Ligne d'invitation */}
                        <div className="project-form-input-row">
                            <label htmlFor="InviteLink">Lien d’invitation</label>
                            <div className="project-form-invite-row">
                                <input id="InviteLink" type="text" value={inviteLink} readOnly />
                                <CopyButton text={inviteLink} />
                            </div>
                        </div>


                        <button type="submit" className="project-form-btn">
                            Générer
                        </button>

                        <div className="project-form-input-row">
                            <label htmlFor="GroupsCreated">Groupes déjà créés</label>
                            <input id="GroupsCreated" type="text" disabled={true} autoComplete="off" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;
