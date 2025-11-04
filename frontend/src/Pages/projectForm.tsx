// typescript
// File: `frontend/src/Components/projectForm.tsx`
import React, { useEffect } from "react";
import "../style/_shared.scss";
import "../style/projectForm.scss";
import CopyButton from "../Components/copyButton.tsx";
import OrganisationSelect from "../Components/organisationSelect.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectForm } from "../contexts/ProjectFormContext.tsx";

const ProjectForm = () => {
    const navigate = useNavigate();
    const { id: editId } = useParams();

    const {
        organizations,
        projectFormData,
        loading,
        error,
        setProjectFormData,
        loadProjectForEdit,
        submitProject,
        generateInviteLink,
        resetForm
    } = useProjectForm();

    // Chargement du projet à modifier si editId présent
    useEffect(() => {
        if (editId) {
            loadProjectForEdit(Number(editId));
        } else {
            resetForm(); // Reset form pour une nouvelle création
        }
    }, [editId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await submitProject(editId);
            navigate("/projects");
        } catch (err) {
            // L'erreur est déjà gérée dans le contexte
        }
    };

    const inviteLink = generateInviteLink(editId);

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            <div className="login-center">
                <div className="project-form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="project-form-input-row">
                            <label htmlFor="ProjectName">Nom du projet</label>
                            <input
                                id="ProjectName"
                                type="text"
                                placeholder="Entrez le nom du projet"
                                autoComplete="off"
                                value={projectFormData.projectName}
                                onChange={e => setProjectFormData({ projectName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="project-form-input-row">
                            <label htmlFor="OrganisationSelect">Organisation</label>
                            <OrganisationSelect
                                organisations={organizations}
                                value={projectFormData.selectedOrganizationId}
                                onChange={(id) => setProjectFormData({ selectedOrganizationId: id })}
                            />
                        </div>
                        <div className="member-row">
                            <label htmlFor="MinMemberCount">Membres</label>
                            <input
                                id="MinMemberCount"
                                type="number"
                                placeholder="min"
                                autoComplete="off"
                                value={projectFormData.minMembers ?? ''}
                                onChange={e => setProjectFormData({
                                    minMembers: e.target.value ? Number(e.target.value) : undefined
                                })}
                                min={1}
                            />
                            <input
                                id="MaxMemberCount"
                                type="number"
                                placeholder="max"
                                autoComplete="off"
                                value={projectFormData.maxMembers ?? ''}
                                onChange={e => setProjectFormData({
                                    maxMembers: e.target.value ? Number(e.target.value) : undefined
                                })}
                                min={1}
                            />
                        </div>
                        {/* Ligne d'invitation */}
                        <div className="project-form-input-row">
                            <label htmlFor="InviteLink">Lien d'invitation</label>
                            <div className="project-form-invite-row">
                                <input id="InviteLink" type="text" value={inviteLink} readOnly />
                                <CopyButton text={inviteLink} />
                            </div>
                        </div>
                        {error && <div style={{color: 'red', marginBottom: 10}}>{error}</div>}
                        <button type="submit" className="project-form-btn" disabled={loading}>
                            {loading ? (editId ? 'Modification...' : 'Création...') : (editId ? 'Modifier' : 'Créer')}
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
