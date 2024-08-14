import { Publicacion } from "../Clases/Publicacion";
import { AccesoPublicacion } from "../Accesos/AccesoPublicacion";
import { MongoClient } from "mongodb";
import { usuarioDB } from "./ControladorUsuario";
import { Tipo } from "../Clases/Tipo";
import { verifyToken } from "../JWT/key";
import { getUserByToken } from "../Accesos/AccesoUsuario";
import { comentariosDB } from "./ControladorComentario";
import { eliminarArchivo } from "..";
import { verify } from "jsonwebtoken";
import { entorno } from "../Entorno/Entorno";
import e from "cors";
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

export var publicacionDB: AccesoPublicacion = new AccesoPublicacion(
    url,
    database,
    database.collection("Publicaciones"),
    usuarioDB,
    comentariosDB
);

export const routerPublicacion = Router();

routerPublicacion.get("/publicaciones/:id", async (_req: any, _res: any) => {
    _res.send(await publicacionDB.getPublicacion(_req.params.id))
})

routerPublicacion.get("/publicaciones", async (_req: any, _res: any) => {
    _res.send(await publicacionDB.getPublicaciones())
})

routerPublicacion.get("/publicaciones/usuario/:mail", verifyToken, async (_req: any, _res: any) => {
    _res.send(await publicacionDB.getPubsUsuario(_req.params.mail))
})

routerPublicacion.post("/publicaciones", verifyToken, async (_req: any, _res: any) => {
    var id
    if (await !publicacionDB.getIdMasAlto) {
        id = 0
    }
    else {
        id = await publicacionDB.getIdMasAlto()
    }

    if (!_req.body.descripcion || !_req.body.titulo || !_req.body.tipo || !_req.body.ubicacion || !_req.body.precio) {
        _res.send("Faltan datos")
        return
    }
    if(isNaN(Number(_req.body.precio))){
        _res.send("El precio tiene que ser un numero")
        return
    }
    if(_req.body.titulo.length > 50){
        _res.send("El titulo es muy largo (max 50 caracteres). Actualmente son: " + _req.body.titulo.length)
        return
    }
    else if (_req.body.precio < 0) {
        _res.send("sos boludo? vas a pagarle al comprador?")
        return
    }

    let publicacionAsubir: Publicacion = new Publicacion(
        Number(_req.body.tipo), 
        Number(id) + 1,
        _req.body.publicaciones,
        _req.body.precio,
        _req.body.descripcion,
        _req.body.titulo,
        _req.body.mailUsuario,
        _req.body.ubicacion
    );
    if (_req.body.tipo == "Adopcion") {
        publicacionAsubir.tipo = Tipo.adopcion
    }
    else if (_req.body.tipo == "Extravio") {
        publicacionAsubir.tipo = Tipo.extravio
    }
    if (!_req.body.publicaciones) {
        publicacionAsubir.fotos = ["/imagenes/publicaciones/default.png"]
    }
    else {
        publicacionAsubir.fotos = ["/imagenes/publicaciones/" + _req.body.publicaciones]
    }
    let mail = await getUserByToken(_req.headers.authorization)
    publicacionDB.subirPublicacion(publicacionAsubir, mail).then((u) => {
        _res.send(u);
    });
});

routerPublicacion.delete("/publicaciones/:id", verifyToken, async (_req: any, _res: any) => {
    let mail = await getUserByToken(_req.headers.authorization)
        publicacionDB.borrarPublicacion(_req.params.id, mail).then((u) => {
            _res.send(204);
        })
})

routerPublicacion.delete("/publicacionesVenta/:id", verifyToken, async (_req:any, _res:any) =>{
    console.log("entra")
    console.log(_req.params.id)
    publicacionDB.borrarPublicacionVenta(_req.params.id)
})

routerPublicacion.get("/publicaciones/verificarIdentidad/:id", async (_req: any, _res: any) => {
    const usuario = await usuarioDB.getUserDataByToken(_req.headers.authorization)
    const publicacion = await publicacionDB.getPublicacion(_req.params.id)
    if (usuario!.correo == publicacion!.mailUsuario) {
        _res.send(true)
    }
    else {
        _res.send(false)
    }

})

routerPublicacion.get("/publicaciones/tipo/:tipo/:pagina", async (_req: any, _res: any) => {
    const itemsPorPagina = 8; 
    const pagina = _req.params.pagina || 0; 
    _res.send(await publicacionDB.getPublicacionesXtipo(Number(_req.params.tipo), pagina, itemsPorPagina))
})

routerPublicacion.patch("/publicaciones/:id", verifyToken, async (_req: any, _res: any) => {
    let publicacionTemp = await publicacionDB.getPublicacion(_req.params.id)
    if (!_req.body.descripcion && !_req.body.titulo && !_req.body.precio && !_req.body.publicaciones) {
        _res.send("Faltan datos")
        return
    }
    if(_req.body.descripcion){
        publicacionTemp!.descripcion = _req.body.descripcion
    }
    if(_req.body.titulo){
        publicacionTemp!.titulo = _req.body.titulo
    }
    if(_req.body.precio){
        publicacionTemp!.precio = _req.body.precio
    }
    if(_req.body.publicaciones){
        eliminarArchivo(publicacionTemp!.fotos)
        publicacionTemp!.fotos = ["/imagenes/publicaciones/" + _req.body.publicaciones]
    }
    if(isNaN(Number(_req.body.precio))){
        _res.send("El precio tiene que ser un numero")
        return
    }
    publicacionDB.modificarPublicacion(publicacionTemp!).then((u) => {
        _res.send(u);
        
    })
})