import {Router, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {listOrganisations} from "../services/projectServices";
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_json_web_token_secret_key";


router.get('/organisations', async (req, res) => {
try {
    const organisations = await listOrganisations();
    return  res.status(200).json({ success: true, organisations : organisations});
}
catch(err: any) {
    return res.status(500).json({ success: false, message: err.message || "Internal server error"});
}
});
export default router;

