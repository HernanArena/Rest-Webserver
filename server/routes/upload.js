const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');
// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (Object.keys(req.files).length == 0) {
    return res.status(400).json({
      ok:false,
      err:{
        message:'No se ha seleccionado ningún archivo'
      }
    });
  }

  //Validar tipos

  let tiposValidos = ['productos','usuarios'];
  if(tiposValidos.indexOf(tipo)<0){
    return res.status(400).json({
      ok:false,
      err:{
        message: 'Las tipos permitidas son ' + tiposValidos.join(', '),
        tipo: tipo
      }
    })
  }


  let archivo = req.files.archivo;
  let nombreArchivo = archivo.name.split('.');
  let extension = nombreArchivo[nombreArchivo.length-1];

  //Extensiones permitidas
  let extensionesValidas=['png','jpg','gif','jpeg'];
  if( extensionesValidas.indexOf(extension)<0){
    return res.status(400).json({
      ok:false,
      err:{
        message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
        ext: extension
      }
    })
  }

  //Cambiar nombre al archivo
  let nombreCambiar = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads/${tipo}/${nombreCambiar}`, (err)=> {
   if (err){
     return res.status(500)
     .json({
       ok:false,
       err
     });
   }
   if (tipo == 'usuarios'){
      imagenUsuario(id, res,nombreCambiar);
   }else{
     imagenProductos(id, res,nombreCambiar);
   }
 });

});
function imagenUsuario(id, res,nombreArchivo){
  Usuario.findById(id,(err,usuarioDB)=>{
    if(err){
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!usuarioDB){
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(400).json({
        ok:false,
        err:{
          message:'Usuario no existe'
        }
      });
    }
    borraArchivo(usuarioDB.img, 'usuarios');

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado)=>{
      res.json({
        ok:true,
        usuario:usuarioGuardado,
        img: nombreArchivo,
        message: 'Imagen subida correctamente'
      });
    })
  });

}
function imagenProductos(id, res, nombreArchivo){
  Producto.findById(id,(err,productoDB)=>{
    if(err){
      borraArchivo(nombreArchivo, 'productos');
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!productoDB){
      borraArchivo(nombreArchivo, 'productos');
      return res.status(400).json({
        ok:false,
        err:{
          message:'Producto no existe'
        }
      });
    }
    borraArchivo(productoDB.img, 'productos');

    productoDB.img = nombreArchivo;
    productoDB.save((err, productosGuardado)=>{
      res.json({
        ok:true,
        producto: productosGuardado,
        img: nombreArchivo,
        message: 'Imagen subida correctamente'
      });
    })
  });

}
function borraArchivo(nombreImagen, tipo){
  let pathImagen = path.resolve(__dirname,`../../uploads/${tipo}/${nombreImagen}`);
  if(fs.existsSync(pathImagen)){
    fs.unlinkSync(pathImagen);
  }
}
module.exports = app;
