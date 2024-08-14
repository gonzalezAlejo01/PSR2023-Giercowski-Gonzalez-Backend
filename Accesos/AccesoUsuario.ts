import { Collection, Db } from "mongodb";
import { Usuario } from "../Clases/Usuario";
import jwt from "jsonwebtoken";
import { usuarioDB } from "../Controladores/ControladorUsuario";
const { createHash } = require('crypto');

export class AccesoUsuario {
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection) {
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getUsuario(correo: string) {
        const filtro = { correo: correo };
        const usuario = await this.collection.findOne(filtro);
        return usuario;
    }

    public async deleteUsuario(correo: string) {
        const filtro = { correo: correo }
        this.collection.deleteOne(filtro)
    }

    public async subirUsuario(usuario: Usuario) {
        this.collection.insertOne(JSON.parse(JSON.stringify(usuario)));
    }

    public async login(correo: string, contraseña: string) {
        const v = await this.getUsuario(correo);

        if (v != undefined) {
            if (v.contraseña == hash(contraseña)) {

                return true;
            }
            else {
                return "contraseña incorrecta";
            }
        }
        else {
            return "Correo no registrado";
        }
    }
    public async getUserDataByToken(token: any){
        const decoded = jwt.decode(token);
        const parsedDecoded = JSON.parse(JSON.stringify(decoded)); 
        const v = await this.getUsuario(parsedDecoded.correo)
        return v;
    }
    public async modificarUsuario(usuario: Usuario){
        const filtro = {correo: usuario.correo}
        this.collection.findOneAndReplace(filtro, usuario)
    }
}
export async function getUserByToken(token: any){
    const decoded = jwt.decode(token);
    const parsedDecoded = JSON.parse(JSON.stringify(decoded)); 
    return parsedDecoded.correo;

}
export async function getUser(mail: any){
    const v = await usuarioDB.getUsuario(mail)
    return v;
}




function hash(string: String) {
    return createHash('sha256').update(string).digest('hex');
}