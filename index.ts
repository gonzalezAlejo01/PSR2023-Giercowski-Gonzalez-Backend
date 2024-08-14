import { routerComentario } from "./Controladores/ControladorComentario";
import { routerPublicacion } from "./Controladores/ControladorPublicacion";
import { routerUsuario } from "./Controladores/ControladorUsuario";
import { routerChat } from "./Controladores/ControladorChat";
import cors from "cors";
import path from "path";
import { verifyToken } from "./JWT/key";
import multer from "multer";
import bodyParser from "body-parser";
import { entorno } from "./Entorno/Entorno";
const fs = require("fs");
const express = require('express')
const port = 3000;

const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, "Entorno", "entorno.env")
dotenv.config({ path: envPath });

export const URL_IMG = process.env.urlImagenes;


const app = express();

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, 'imagenes/' + file.fieldname);
    },

    filename: (req, file, cb) => {
      const timestamp = new Date().getTime();
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${timestamp}.${fileExtension}`;
      req.body[file.fieldname] = uniqueFilename
      cb(null, uniqueFilename);
  }, 

  });
const upload = multer({ storage: storage });

export function eliminarArchivo(ruta: string){
  if (fs.existsSync(String(ruta).substring(1))) {
    if(!ruta.includes("perfil.jpg") && !ruta.includes("default.jpg")){
      fs.unlinkSync(String(ruta).substring(1));
    }
  }
}


app.get("/", (req: any, res: any) => {
  res.send("Bienvenido a mi API")
});

app.use(upload.fields([{ name: 'perfil' }, { name: 'publicaciones'}]))
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.use(express.json());
app.use(cors(), routerUsuario);
app.use(cors(), routerPublicacion)
app.use(cors(), routerComentario)
app.use(cors(), routerChat)

app.listen(3000, () => {
    console.log("Api corriendo");
  });