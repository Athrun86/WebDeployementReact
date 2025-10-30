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

export async function requestOrganisations(token: string): Promise<any[]> {
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

export async function createProject(data: any, token: string) {
    // data doit contenir id, securityKey, et autres champs nécessaires
    try {
        const resp = await axios.post(apiUrl + '/projects', data, {
            headers: { authorization: `Bearer ${token}` }
        });
        return resp.data;
    } catch (err: any) {
        if (err.response && err.response.status === 409) {
            throw new Error('ID déjà pris. Veuillez rafraîchir le formulaire.');
        }
        throw err;
    }
}
