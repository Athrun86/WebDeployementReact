import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export async function requestvalidationToken(token: string): Promise<boolean> {
    try {
        await axios.get(`${apiUrl}/login/validate-token`, {
            headers: { authorization: `Bearer ${token}`  }
        });
        return true;
    }
    catch (err) {
        return false;
    }
}

export async function requestOrganizations(token: string): Promise<any[]> {
    try {
        const resp = await axios.get(apiUrl + '/projects/organisations', {
            headers: { authorization: `Bearer ${token}` }
        });
        return resp.data.organisations;
    } catch (err) {
        throw err;
    }
}

export async function requestNextProjectId(token: string): Promise<number> {
    const resp = await axios.get(apiUrl + '/projects/next-id', {
        headers: { authorization: `Bearer ${token}` }
    });
    return resp.data.nextId;
}

function getProjectErrorMessage(err: any) {
    if (err.response) {
        if (err.response.status === 409) {
            return 'ID déjà pris. Veuillez rafraîchir le formulaire.';
        }
        if (err.response.status === 410) {
            return 'This organization is already used by another project.';
        }
        if (err.response.status === 400) {
            return err.response.data?.message || 'Champs manquants ou invalides.';
        }
        if (err.response.status === 401) {
            return 'Authentification requise ou expirée.';
        }
        if (err.response.status === 500) {
            return 'Erreur serveur. Veuillez réessayer plus tard.';
        }
    }
    return err.message || 'Erreur inconnue.';
}

export async function createProject(data: any, token: string) {
    try {
        const resp = await axios.post(apiUrl + '/projects', data, {
            headers: { authorization: `Bearer ${token}` }
        });
        return resp.data;
    } catch (err: any) {
        throw new Error(getProjectErrorMessage(err));
    }
}
export async function requestProjects(token: string)
{
    try {
        const resp = await axios.get(apiUrl + '/projects/list', {
            headers: { authorization: `Bearer ${token}` }
        });
        return resp.data.projects;
    }
    catch (err) {
        throw err;

    }

}
export async function getProjectById(id: number, token: string) {
    const resp = await axios.get(`${apiUrl}/projects/${id}`, {
        headers: { authorization: `Bearer ${token}` }
    });
    return resp.data.project;
}

export async function updateProject(id: number, data: any, token: string) {
    try {
        const resp = await axios.put(`${apiUrl}/projects/${id}`, data, {
            headers: { authorization: `Bearer ${token}` }
        });
        return resp.data;
    } catch (err: any) {
        throw new Error(getProjectErrorMessage(err));
    }
}
