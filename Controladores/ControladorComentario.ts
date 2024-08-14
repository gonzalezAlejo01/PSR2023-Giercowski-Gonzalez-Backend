import { MongoClient } from "mongodb";
import { AccesoComentario } from "../Accesos/AccesoComentario";
import { Comentario } from "../Clases/Comentario"
import { verifyToken } from "../JWT/key";
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

export var comentariosDB: AccesoComentario = new AccesoComentario(
    url,
    database,
    database.collection("Comentarios"),

);

export const routerComentario = Router();

routerComentario.get("/comentarios/:id", async (_req: any, _res: any) => {
    _res.send(await comentariosDB.getComentario(_req.params.id, _req.body.idPublicacion))
})

routerComentario.post("/comentarios", verifyToken, async (_req: any, _res: any) => {
    let comentarioAsubir = new Comentario(Number(await comentariosDB.getIdMasAlto()+1),_req.body.mailUsuario,_req.body.contenido, Number(_req.body.idPublicacion), new Date())
    if(!_req.body.contenido){
        _res.send("No podes mandar un comentario vacio")
        return
    }
    if(_req.body.contenido.length > 140){
        _res.send("El comentario es muy largo (max 140 caracteres). Actualmente son: " + _req.body.contenido.length)
        return
    }
    comentariosDB.subirComentario(comentarioAsubir).then((u) => {  
        _res.send(204);
    });
})

routerComentario.delete("/comentarios/:id",verifyToken,  async (_req: any, _res: any) => {
    _res.send(await comentariosDB.deleteComentario(_req.params.id, _req.body.idPublicacion))
})

routerComentario.get("/comentariosXpublicacion/:id", async (_req: any, _res: any) => {
    _res.send(await comentariosDB.getComentarios(Number(_req.params.id)))
})

routerComentario.patch("/comentarios/:id", verifyToken, async (_req: any, _res: any) => {
    _res.send(await comentariosDB.responderComentario(_req.body.respuesta, _req.params.id))
})