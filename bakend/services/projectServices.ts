import {Users } from '../models/User';
import {Octokit} from "octokit";
import {decryptToken} from "../utils/crypto";
import {components} from "@octokit/openapi-types";
import {NextFunction} from "connect";
import any = jasmine.any;

type Organisation = components["schemas"]["organization-simple"];




export async function listOrganisations() {

    const user = await Users.findOne();
    if (!user || !user.token) {
        throw new Error('No user or token found');
    }
    const encryptedToken = user.token;
    if (!encryptedToken) {
        throw new Error('No token found for user');
    }
    let githubToken: string;
    try {
        githubToken = decryptToken(encryptedToken);
    } catch (e) {
        console.error('Error decrypting token:', e);
        throw new Error('Failed to decrypt token');
    }
    const octokit = new Octokit({ auth: githubToken });
    try {
        const resp = await octokit.rest.orgs.listForAuthenticatedUser();
        return resp.data.map((org: Organisation) => ({
            id: org.id,
            login:  org.login,
            avatar_url: org.avatar_url,
            url: org.url,
        }));
    }catch (e: any) {
    const  err : any = new Error(e?.message ?? "Error fetching organisations");
    err.status = e?.status ?? 502;
    throw err;
    }
    }


