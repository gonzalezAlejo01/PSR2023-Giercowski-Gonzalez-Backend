import { tokenToString } from "typescript";

export const SECRET_KEY = "catALEJO";
const jwt = require("jsonwebtoken");
export function verifyToken(_req: any, _res: any, next: any) {
    const token = _req.headers.authorization;
    if (!token) {
        return _res
            .status(401)
            .send({ message: "Unauthorized: No token provided." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        _req.usuario = decoded;
        next();
    } catch (err) {
        return _res.status(401).send({ message: "Unauthorized: Invalid token." });
    }
}