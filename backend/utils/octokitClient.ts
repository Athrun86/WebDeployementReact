import {Octokit} from "octokit";
import {decryptToken} from "./crypto";


/**
 * Creates an Octokit client instance
 * @param token - Optional encrypted token for authenticated requests
 * @returns Octokit client instance
 */
export function createOctokitClient(token?: string): Octokit {
    if (token) {
        const decryptedToken = decryptToken(token);
        return new Octokit({
            auth: decryptedToken
        });
    }

    // Return unauthenticated client for public API calls
    return new Octokit();
}