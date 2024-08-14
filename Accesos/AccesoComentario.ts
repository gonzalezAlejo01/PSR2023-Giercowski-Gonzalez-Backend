import { Collection, Db } from "mongodb";
import { AccesoPublicacion } from "./AccesoPublicacion";
import { Comentario } from "../Clases/Comentario";

export class AccesoComentario {
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection) {
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getIdMasAlto() {
        if (await this.database.listCollections({ name: "Comentarios" }).hasNext()) {
            const comentario = await this.collection.find().sort({ id: -1 }).limit(1).toArray()
            if (!comentario[0]?.id) {
                return 0
            }
            else {
                return comentario[0]?.id;
            }
        }
        return 0;
    }

    public async getComentario(id: Number, idPublicacion: Number) {
        var publicacion = await this.collection.findOne({ idPublicacion: idPublicacion })
        return publicacion!.comentarios.find((comentario: Comentario) => comentario.id == id)
    }

    public async subirComentario(comentario: Comentario) {
        this.collection.insertOne(comentario);
    }

    public async deleteComentario(id: Number, idPublicacion: Number) {
        await this.collection.findOne({ id: idPublicacion }).then((u) => {
            u!.comentarios.pop(id);
            this.collection.updateOne({ id: idPublicacion }, { $set: { comentarios: u!.comentarios } })
        })
    }
    public async getComentarios(idPublicacion: Number) {
        const comentarios =  await this.collection.find({ idPublicacion: Number(idPublicacion) }).sort({ id: -1 }).toArray()
        return comentarios
    }
    public async responderComentario(respuesta: String, idComentario: any) {
        var comentarioTemp: Comentario | undefined = undefined
        await this.collection.findOne({ id: Number(idComentario) }).then((u) => {
            comentarioTemp = new Comentario(u!.id, u!.mailUsuario, u!.contenido, u!.idPublicacion, u!.fecha)
            comentarioTemp!.respondido = true
            comentarioTemp!.respuesta = respuesta
            this.collection.findOneAndReplace({ id: Number(idComentario) }, comentarioTemp)
        })
    }
}