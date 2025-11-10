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

export async function login(username: string, password: string): Promise<{ token?: string; message?: string }> {
    try {
        const resp = await axios.post(`${apiUrl}/login`, { username, password });
        if (resp.status === 200) {
            return { token: resp.data?.token };
        } else {
            return { message: resp.data?.message || resp.statusText || 'Authenticate error' };
        }
    } catch (err: any) {
        throw err;
    }
}

// Group and Student related functions
export async function getProjectInfo(projectId: string, securityKey: string): Promise<{isValid: boolean, data?: any, message?: string}> {
    const fullUrl = `${apiUrl}/groups/project/${projectId}/${securityKey}`;
    console.log(`🌐 Frontend API Call: GET ${fullUrl}`);

    try {
        const resp = await axios.get(fullUrl);
        console.log(`✅ API Response received:`, resp.status, resp.data);
        return resp.data;
    } catch (error: any) {
        console.error(`❌ API Error for ${fullUrl}:`, error);

        if (error.response) {
            console.log(`📄 Error response data:`, error.response.data);
            console.log(`📊 Error status:`, error.response.status);
            return error.response.data;
        }

        console.log(`🔍 Network error - no response from server`);
        return {
            isValid: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

export async function createGroup(
    projectId: string,
    securityKey: string,
    students: Array<{name: string, username: string}>
): Promise<{success: boolean, group?: any, students?: any[], message?: string}> {
    const fullUrl = `${apiUrl}/groups/create`;
    const payload = { projectId, securityKey, students };

    console.log(`🌐 Frontend API Call: POST ${fullUrl}`);
    console.log(`📋 Payload:`, payload);

    try {
        const resp = await axios.post(fullUrl, payload);
        console.log(`✅ Group creation response:`, resp.status, resp.data);
        return resp.data;
    } catch (error: any) {
        console.error(`❌ Group creation error:`, error);

        if (error.response) {
            console.log(`📄 Error response data:`, error.response.data);
            console.log(`📊 Error status:`, error.response.status);
            return error.response.data;
        }

        console.log(`🔍 Network error during group creation`);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

