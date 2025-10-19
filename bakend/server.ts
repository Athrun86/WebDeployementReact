import express from 'express';
import bodyParser from 'body-parser';
import { Octokit } from "octokit";
import {Users} from './models/User';
import {Sequelize } from 'sequelize-typescript';
import * as mariadb from "mariadb";
import {hashSync, compareSync} from "bcrypt";
import * as seqserver from "./authService"



const octogit = new Octokit({
    auth: "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"
});
const app = express()
const port = 3000;
app.use(bodyParser.json());


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }
    const isvalid = await seqserver.checkLogin(username, password);
    if (!isvalid) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
    return res.status(200).json({ success: true, message: "Login successful" });


})


