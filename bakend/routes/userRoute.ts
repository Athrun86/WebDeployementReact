import {Router, Request, Response} from 'express';
import {checkLogin} from "../services/authService";
const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({success: false, message: "Username and password are required"});
    }
    const ok = await checkLogin(username, password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid login or password" });

    return res.status(200).json({ success: true, message: "Login successful" });
})
export default router;