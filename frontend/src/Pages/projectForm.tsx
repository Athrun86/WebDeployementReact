// typescript
// File: `frontend/src/Components/projectForm.tsx`
import {useEffect, useState} from "react";
import "../style/_shared.scss";
import "../style/projectForm.scss";
import CopyButton from "../Components/copyButton.tsx";
import OrganisationSelect from "../Components/organisationSelect.tsx";
import {requestOrganisations, requestNextProjectId, createProject} from "../api/repository.ts";
import {useAtom} from "jotai";
import {tokenAtom} from "../utils/tokenAtom.ts";
import { useNavigate } from "react-router-dom";

function generateSecurityKey() {
    // Génère une clé aléatoire de 32 caractères hexadécimaux
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

const ProjectForm = () => {
    const [projectName, setProjectName] = useState('');
    const [minMembers, setMinMembers] = useState<number | undefined>();
    const [maxMembers, setMaxMembers] = useState<number | undefined>();
    const [tokenAtomValue] = useAtom(tokenAtom);
    const token: string | null = tokenAtomValue ?? null;
    const [organisations, setOrganisations] = useState<any[]>([]);
    const [selectedOrganisationId, setSelectedOrganisationId] = useState<number | undefined>();
    const [nextProjectId, setNextProjectId] = useState<number | null>(null);
    const [securityKey] = useState(() => generateSecurityKey());
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchOrganisations() {
            if (!token) return;
            try {
                const orgs = await requestOrganisations(token);
                setOrganisations(orgs);
            } catch (e) {
                console.error("Erreur récupération organisations dans composant:", e);
            }
        }
        if (token) fetchOrganisations();
    }, [token]);

    useEffect(() => {
        async function fetchNextId() {
            if (!token) return;
            try {
                const id = await requestNextProjectId(token);
                setNextProjectId(id);
            } catch (e) {
                setNextProjectId(null);
            }
        }
        if (token) fetchNextId();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (!token) {
            setError("Token d'authentification manquant. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }
        if (!nextProjectId || !securityKey || !projectName || !selectedOrganisationId || minMembers === undefined || maxMembers === undefined) {
            setError("Tous les champs sont obligatoires.");
            setLoading(false);
            return;
        }
        if (!Number.isInteger(minMembers) || minMembers < 1) {
            setError("Le nombre minimum de membres doit être un entier positif (>= 1).");
            setLoading(false);
            return;
        }
        if (!Number.isInteger(maxMembers) || maxMembers < 1) {
            setError("Le nombre maximum de membres doit être un entier positif (>= 1).");
            setLoading(false);
            return;
        }
        if (maxMembers < minMembers) {
            setError("Le nombre maximum de membres doit être supérieur ou égal au minimum.");
            setLoading(false);
            return;
        }
        try {
            await createProject({
                id: nextProjectId,
                name: projectName,
                organizationName: organisations.find(o => o.id === selectedOrganisationId)?.login || '',
                githubUrl: organisations.find(o => o.id === selectedOrganisationId)?.url || '',
                minMembers,
                maxMembers,
                securityKey
            }, token);
            navigate("/projects");
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création du projet.");
        } finally {
            setLoading(false);
        }
    };

    // Le lien d'invitation est généré avec le prochain id réel
    const inviteLink = nextProjectId ? `${window.location.origin}/studentAdd/${nextProjectId}/${securityKey}` : '';

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
                                value={projectName}
                                onChange={e => setProjectName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="project-form-input-row">
                            <label htmlFor="OrganisationSelect">Organisation</label>
                            <OrganisationSelect
                                organisations={organisations}
                                value={selectedOrganisationId}
                                onChange={setSelectedOrganisationId}
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
                        {error && <div style={{color: 'red', marginBottom: 10}}>{error}</div>}
                        <button type="submit" className="project-form-btn" disabled={loading}>
                            {loading ? 'Création...' : 'Générer'}
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
