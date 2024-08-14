import { Collection, Db } from "mongodb";
import { Publicacion } from "../Clases/Publicacion";
import { AccesoUsuario } from "./AccesoUsuario";
import { Tipo } from "../Clases/Tipo";
import { Usuario } from "../Clases/Usuario";
import { AccesoComentario } from "./AccesoComentario";

export class AccesoPublicacion {
    url: String;
    database: Db;
    collection: Collection;
    accesoUsuario: AccesoUsuario;
    accessoComentario: AccesoComentario;

    constructor(url: String, database: Db, collection: Collection, accesoUsuario: AccesoUsuario, accessoComentario: AccesoComentario) {
        this.url = url;
        this.database = database;
        this.collection = collection;
        this.accesoUsuario = accesoUsuario;
        this.accessoComentario = accessoComentario;

    }

    public async getPublicacion(id: Number) {
        const filtro = { id: Number(id) };
        const publicacion = await this.collection.findOne(filtro);
        return publicacion;
    }
    public async getIdMasAlto() {

        if (await this.database.listCollections({ name: "Publicaciones" }).hasNext()) {
            const publicacion = await this.collection.find().sort({ id: -1 }).limit(1).toArray()
            if(!publicacion[0]?.id){
                return 0
            }
            else{
                return publicacion[0]?.id;
            }
            
        }
        return false;


    }

    public async subirPublicacion(publicacion: Publicacion, mail: String) {
        if (mail == publicacion.mailUsuario) {
            this.collection.insertOne(JSON.parse(JSON.stringify(publicacion)));
            this.accesoUsuario.getUsuario(String(publicacion.mailUsuario)).then((u) => {
                u!.publicaciones.push(publicacion.id);
                this.accesoUsuario.collection.updateOne({ correo: u!.correo }, { $set: { publicaciones: u!.publicaciones } })
            });
            return "Publicacion subida"
        }
        else{
            return "Acceso denegado"
        }

    }

    public async borrarPublicacion(id: Number, mail: String) {
        var publicacion = await this.getPublicacion(id)
        if (mail == publicacion?.mailUsuario) {
            this.collection.deleteOne({ id: Number(id) })
            await this.accesoUsuario.getUsuario(JSON.parse(JSON.stringify(publicacion)).mailUsuario).then((u) => {
                this.accesoUsuario.collection.updateOne({ correo: u!.correo }, { $pull: { publicaciones: Number(id) } })
            });
            await this.accessoComentario.collection.deleteMany({ idPublicacion: Number(id) })
        }
        else if (publicacion === null) {
            return "n/a"
        }
        else {
            return "Acceso denegado"
        }
    }

    public async borrarPublicacionVenta(id: Number){
        var publicacion = await this.getPublicacion(id)
        if(publicacion?.tipo == Tipo.adopcion){
            this.collection.deleteOne({ id: Number(id) })
            await this.accesoUsuario.getUsuario(JSON.parse(JSON.stringify(publicacion)).mailUsuario).then((u) => {
                this.accesoUsuario.collection.updateOne({ correo: u!.correo }, { $pull: { publicaciones: Number(id) } })
            });
            await this.accessoComentario.collection.deleteMany({ idPublicacion: Number(id) })
        }
        else{
            return "Acceso denegado"
        }
    }

    public async getPublicaciones() {
        return this.collection.find().toArray()
    }
    public async getPublicacionesXtipo(tipo: number, pagina: number, itemsPorPagina: number) {
        if(tipo == 0){
            return {
                pubs:  await this.collection.find({tipo: tipo}).skip(pagina * itemsPorPagina).limit(itemsPorPagina).toArray(),   
                hayMas: (await this.collection.find({tipo: tipo}).toArray()).length >= itemsPorPagina*(Number(pagina) + 1)
            }
        }
        else{
            return this.collection.find({tipo: tipo}).toArray()
        }
    }
    public async getPubsUsuario(mail: String) {
        const filtro = { mailUsuario: mail };
        const publicaciones = await this.collection.find(filtro).toArray();
        return publicaciones;
    }
    
public async modificarPublicacion(publicacion: any){
    const filtro = { id: publicacion.id };
    await this.collection.findOneAndReplace(filtro, publicacion)
    return "publicacion modificada"
}
}
