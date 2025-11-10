


import { Users } from '../models/User';
import { hashSync, compareSync } from 'bcrypt';
import { sequelize } from "../db/sequelizeInstance"
import { Octokit } from "octokit";

import { decryptToken} from "../utils/crypto";


export  async function checkLogin (username: string, password: string)
{
    const user = await Users.findOne({ where: { username: username } });
    if (!user) return false;

    if(!compareSync(password, user.password)) return false;
    const token = user.token;
    if (!token) return false;
    try {
        const decryptedToken = decryptToken(token);
        const octokit = new Octokit({auth: decryptedToken});
        const resp = await octokit.request('GET /user');
        return  resp.status === 200 ;

    } catch (e) {
        console.error('GitHub token validation error:', e);
        return false;
    }
}