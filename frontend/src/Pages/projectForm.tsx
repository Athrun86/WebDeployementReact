// typescript
// File: `frontend/src/Components/projectForm.tsx`
import { useState, useEffect } from "react";
import "../style/_shared.scss";
import "../style/projectForm.scss";
import CopyButton from "./copyButton.tsx";
import OrganisationSelect from "./organisationSelect.tsx";
import api from "../api/repository";

const ProjectForm = () => {
    const [projectName, setProjectName] = useState('');
    const [minMembers, setMinMembers] = useState<number | undefined>();
    const [maxMembers, setMaxMembers] = useState<number | undefined>();
    const [organisation, setOrganisation] = useState<string | undefined>();
    const [localId, setLocalId] = useState<string | undefined>(); // id suggéré / réel
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Au montage : récupérer tous les projets, déterminer l'id max puis +1
    useEffect(() => {
        let mounted = true;
        const fetchMaxId = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get('/projects');
                const data = res.data;
                // extractions flexibles selon structure retournée par l'API
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.projects)
                        ? data.projects
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];
                const maxId = list.reduce((acc: number, p: any) => {
                    const id = Number(p?.id ?? p?._id ?? p?.ID ?? 0);
                    return Number.isFinite(id) ? Math.max(acc, id) : acc;
                }, 0);
                if (mounted) {
                    setLocalId(String(maxId + 1));
                }
            } catch (err: any) {
                if (mounted) setError(err?.response?.data?.message ?? err?.message ?? 'Erreur chargement projets');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchMaxId();
        return () => {
            mounted = false;
        };
    }, []);

    const inviteLink = `${window.location.origin}/add-student/${localId ?? 'nouveau'}`;

    const handleGenerate = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // ici appeler l'API pour créer le projet ; on garde un console.log pour l'exemple
        console.log("Génération / mise à jour projet", {
            projectName,
            minMembers,
            maxMembers,
            organisation
        });
        // Exemple : après création côté backend vous pourriez faire :
        // const res = await api.post('/projects', { name: projectName, minMembers, maxMembers, organisation });
        // if (res?.data?.id) setLocalId(String(res.data.id));
    };

    if (loading) {
        return (
            <div className="project-form-container">
                <p>Chargement des projets...</p>
            </div>
        );
    }

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            <div className="login-center">
                <div className="project-form-container">
                    <form onSubmit={handleGenerate}>
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
                            <OrganisationSelect
                                value={organisation}
                                onChange={setOrganisation}
                                placeholder="Choisir une organisation"
                            />
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

                        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

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
