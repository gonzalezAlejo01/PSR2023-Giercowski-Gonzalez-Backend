import { MongoClient } from "mongodb";
import { AccesoChat } from "../Accesos/AccesoChat";
import { Chat } from "../Clases/Chat";
import { Mensaje } from "../Clases/Mensaje";
import { verifyToken } from "../JWT/key";
import { getUserByToken } from "../Accesos/AccesoUsuario";
import { getUser } from "../Accesos/AccesoUsuario";
import { entorno } from "../Entorno/Entorno";
const Router = require("express")
const jwt = require("jsonwebtoken");

const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, "..", "Entorno", "entorno.env")
dotenv.config({ path: envPath });

if(!process.env.url){
    console.log("NO HAY NADAAA")
}
const url = process.env.url!
const client = new MongoClient(url);
const database = client.db(process.env.database);

export var chatsDb: AccesoChat = new AccesoChat(
    url,
    database,
    database.collection("Chats"),
);

export const routerChat = Router();

routerChat.get("/chats/:id", async (_req: any, _res: any) => {
    _res.send(await chatsDb.getChat(_req.params.id))
})
routerChat.post("/getchats", async (_req: any, _res: any) => {
    _res.send(await chatsDb.getChats(_req.body.mail))
})
routerChat.get("/chats/:mail/:mail2", async (_req: any, _res: any) => {
    _res.send(await chatsDb.getChatConUsuario(_req.params.mail, _req.params.mail2))
})
routerChat.get("/chats/:id/:mail/:mail2", async (_req: any, _res: any) => {
    _res.send(await chatsDb.getChatConUsuarioPorId(_req.params.id, _req.params.mail, _req.params.mail2))
})
routerChat.get("/mensajes/:id", async (_req: any, _res: any) => {
    _res.send(await chatsDb.getMensajes(_req.params.id))
})
routerChat.post("/chats", verifyToken, async (_req: any, _res: any) => {
    if(await chatsDb.getChatConUsuario(_req.body.mailUsuario1, _req.body.mailUsuario2)){
        _res.status(400).send("Ya existe un chat entre esos usuarios")
        return
    }
    let mailUsuario = await getUserByToken(_req.headers.authorization)
    if(!_req.body.mailUsuario2){
        _res.status(400).send("No se ha enviado el mail del usuario 2")
        return
    }
    if(_req.body.mailUsuario2 == mailUsuario){
        _res.status(400).send("No podes iniciar un chat con vos mismo")
        return
    }
    if(!await getUser(_req.body.mailUsuario2)){
        _res.status(400).send("No existe el usuario con el mail enviado")
        return
    }
    let chatAsubir = new Chat(Number(await chatsDb.getIdMasAlto() + 1), _req.body.mailUsuario1, _req.body.mailUsuario2)
    chatsDb.subirChat(chatAsubir).then((u) => {
        _res.status(204).send(u);
    });
})
routerChat.delete("/chats/:id", verifyToken, async (_req: any, _res: any) => {
    _res.send(await chatsDb.deleteChat(_req.params.id))
})
routerChat.patch("/chats/:id", verifyToken, async (_req: any, _res: any) => {
    let mailUsuario = await getUserByToken(_req.headers.authorization)
    if(!_req.body.contenido){
        _res.status(400).send("No se ha enviado el contenido del mensaje")
        return
    }
    if(!_req.body.mailUsuario){
        _res.status(400).send("No se ha enviado el mail del usuario")
        return
    }
    if(_req.body.mailUsuario != mailUsuario){
        _res.status(400).send("El mail del usuario no coincide con el del token")
        return
    }
    let mensaje = new Mensaje(_req.body.contenido, _req.body.mailUsuario, new Date())
    chatsDb.subirMensaje(Number(_req.params.id), mensaje).then((u) => {
        _res.send(204);
    });
})