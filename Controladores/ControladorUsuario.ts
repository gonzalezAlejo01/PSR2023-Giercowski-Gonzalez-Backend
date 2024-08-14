import { Usuario } from "../Clases/Usuario";
import { AccesoUsuario } from "../Accesos/AccesoUsuario";
import { MongoClient } from "mongodb";
import { publicacionDB } from "./ControladorPublicacion";
const Router = require("express")
const { createHash } = require("crypto");
const jwt = require("jsonwebtoken");
import { SECRET_KEY, verifyToken } from "../JWT/key";
import { eliminarArchivo } from "..";
import { entorno } from "../Entorno/Entorno";
const claveSecureta = SECRET_KEY;

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

const mailRegex: RegExp = new RegExp("[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}");
const contraRegex: RegExp = new RegExp("^(?=.*[A-Z])(?=.*[0-9]).{8,}$");

export var usuarioDB: AccesoUsuario = new AccesoUsuario(
  url,
  database,
  database.collection("Usuarios")
);

export const routerUsuario = Router();

function hash(string: string) {
  return createHash("sha256").update(string).digest("hex");
}

routerUsuario.get("/usuarios", async (_req: any, _res: any) => {
  const usuarios = await usuarioDB.collection.find({}).toArray();
  _res.json(usuarios);
});
routerUsuario.get("/usuarios/:correo", async (_req: any, _res: any) => {
  const v = await usuarioDB.getUsuario(_req.params.correo);
  _res.json(v);
})

routerUsuario.get("/usuariosToken/userData", async (_req: any, _res: any) => {
  const v = await usuarioDB.getUserDataByToken(_req.headers.authorization);
  _res.json(v);
});
routerUsuario.get("/verificarLogeado", verifyToken, async (_req: any, _res: any) => {
  _res.send(204)
})

routerUsuario.post("/usuarios", async (_req: any, _res: any) => {
  let usuarioAsubir: Usuario = new Usuario(
    _req.body.correo,
    _req.body.nombre,
    _req.body.contraseña,
    _req.body.direccion,
    "/imagenes/perfil/perfil.jpg",
    _req.body.telefono
  );

  if (!_req.body.correo || !_req.body.nombre || !_req.body.contraseña || !_req.body.direccion || !_req.body.telefono) {
    _res.send("Faltan datos");
    return;
  }

  if (!mailRegex.test(usuarioAsubir.correo)) {
    _res.send("El mail no es valido");
    return;
  }
  if (!contraRegex.test(usuarioAsubir.contraseña)) {
    _res.send("La contraseña no es segura, se requiere una mayuscula, un numero y 8 caracteres");
    return;
  }
  if (await usuarioDB.getUsuario(usuarioAsubir.correo) != undefined) {
    _res.send("La dirección de correo ya esta en uso")
    return;
  }
  if(isNaN(Number(_req.body.telefono)) || _req.body.telefono.length != 10){
    _res.send("Numero de telefono invalido")
    return
}
  usuarioAsubir.contraseña = await hash(usuarioAsubir.contraseña);
  usuarioDB.subirUsuario(usuarioAsubir).then((u) => {
    _res.send(204);
  });
});

routerUsuario.post("/usuarios/login", async (_req: any, _res: any) => {

  if (!_req.body.correo || !_req.body.contraseña) {
    _res.send("Faltan datos");
    return;
  }
  usuarioDB.login(_req.body.correo, _req.body.contraseña).then((v) => {
    if (v == true) {
      let data = {
        correo: _req.body.correo,
      };
      let tokenJWT = jwt.sign(data, claveSecureta, { expiresIn: "2h" });
      _res.json(tokenJWT)
    } else {
      _res.send(v);
    }
  })
});

routerUsuario.delete("/usuarios", async (_req: any, _res: any) => {

  let usuarioTemp = JSON.parse(JSON.stringify(await usuarioDB.getUsuario(_req.body.correo)))
  usuarioTemp = usuarioTemp.publicaciones
  for (let i = 0; i < usuarioTemp.length; i++) {
    publicacionDB.borrarPublicacion(i, _req.body.correo)
  }
  usuarioDB.deleteUsuario(_req.body.correo)
  _res.send(204)
})

routerUsuario.patch("/usuarios/:correo", async (_req: any, _res: any) => {
  usuarioDB.getUserDataByToken(_req.headers.authorization).then((u) => {
    var usuarioTemp = new Usuario(u!.correo, u!.nombre, u!.contraseña, u!.direccion, u!.foto, u!.telefono)
    if (!_req.body.nombre && !_req.body.direccion && !_req.body.perfil) {
      _res.send("Faltan datos")
      return
    }
    if (_req.body.nombre) {
      usuarioTemp.nombre = _req.body.nombre
    }
    if (_req.body.direccion) {
      usuarioTemp.direccion = _req.body.direccion
    }
    if (_req.body.perfil) {
      eliminarArchivo(u!.foto)
      usuarioTemp.foto = "/imagenes/perfil/" + _req.body.perfil
    }
    if(_req.body.telefono){
      usuarioTemp.telefono = _req.body.telefono
    }
    usuarioDB.modificarUsuario(usuarioTemp)

    _res.send(204)
  })
})

