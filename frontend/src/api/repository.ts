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
export async function requestOrganisations(token: string): Promise<string[]> {
        const resp = await axios.get(`${apiUrl}/projects/organisations`, {
            headers: {authorization: `Bearer ${token}`}
        });
        return resp.data.organisations || [];


}
