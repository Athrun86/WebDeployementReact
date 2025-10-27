import {Router, Request, Response} from 'express';
import {checkLogin} from "../services/userServices";
import  jwt  from "jsonwebtoken";
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_json_web_token_secret_key";

router.post('/', async (req: Request, res: Response) => {
    const {username, password} = req.body;
    if (!username || !password ) {
        return res.status(400).json({success: false, message: "Username and password are required"});
    }
    const ok = await checkLogin(username, password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid login or password" });
    const token = jwt.sign({username}, JWT_SECRET, {expiresIn: '2h'});
    return res.status(200).json({ success: true, message: "Login successful" , token});
});

router.get('/validate-token', async (req: Request, res: Response) => {
 const authHeader = req.headers.authorization
 if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization authHeader is required" });

 }
 else try {
     const raw = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
     jwt.verify(raw, JWT_SECRET);
     return res.status(200).json({success: true, message: "Token is valid"});
 }
    catch (err : any ){
        if(err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError"){
            return res.status(401).json({ success: false, message: "Invalid token or expired" });
        }
 }


});
export default router;