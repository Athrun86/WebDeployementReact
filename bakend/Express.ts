import express from 'express';
import bodyParser from 'body-parser';
import { Octokit } from "octokit";
import {Users} from './User';



const octogit = new Octokit({
    auth: "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"
});
const app = express()
const port = 3000;
app.use(bodyParser.json());


app.post('/users', async (req, res) => {
    try {
        const users = await Users.findAll()
    } catch (e) {

    }
})



/*app.Post('/login', (req, res) => {
    string {username, password} = req.body;
    if ()
    {

    }




})*/