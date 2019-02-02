const express = require('express');

const app = express();

const { verificaToken,verificaAdmin_role } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

//=============================================
// Obtener todos los productos
//=============================================

app.get('/productos',verificaToken, (req, res) =>{
  let desde =req.query.desde || 0
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

    Producto.find({disponible:true})
    .skip(desde)
    .limit(limite)
    .populate('usuario','nombre email')
    .populate('categoria','descripcion')
    .exec((err, productos)=>{
      if(err){
        return res.status(400).json({
        ok:false,
        err
        });
      }
      Producto.count({disponible:true},(err,conteo)=>{
        res.json({
          ok:true,
          productos,
          cantidad: conteo
        })
      })
    });
});

//=============================================
// Obtener producto por id
//=============================================

app.get('/producto/:id',(req, res) =>{
  let id = req.params.id;

  Producto.findById(id)
  .populate('usuario','nombre email')
  .populate('categoria','descripcion')
  .exec((err, productoDB) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!productoDB){
      return res.status(400).json({
        ok:false,
        err:{
          message:"El producto no existe en la base de datos"
        }
      });
    }
    res.json({
      ok:true,
      productoDB
    });
  });

});
//=============================================
// Buscar Productos
//=============================================
app.get('/producto/buscar/:termino',(req, res)=>{
  let termino = req.params.termino;
  let regex = new RegExp(termino,'i');

  Producto.find({nombre: regex, disponible: true})
    .populate('categoria','descripcion')
    .exec((err, productoDB) => {
      if(err){
        return res.status(500).json({
          ok:false,
          err
        });
      }
      if(!productoDB){
        return res.status(400).json({
          ok:false,
          err:{
            message:"El producto no existe en la base de datos"
          }
        });
      }
      res.json({
        ok:true,
        productoDB
      });

    });
})
//=============================================
// Crear un producto
//=============================================

app.post('/producto',[verificaToken,verificaAdmin_role], (req, res) =>{
  let id = req.usuario._id
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    categoria: body.categoria,
    usuario: id
  });
  producto.save( (err, productoDB)=>{
    if (err){
      return res.status(500).json({
        ok:false,
        err
      })
    }
    if (!productoDB){
      return res.status(400).json({
        ok:false,
        err
      })
    }
    res.json({
      ok:true,
      producto:productoDB
    })
  })

});
//=============================================
// Actualizar un producto
//=============================================

app.put('/producto/:id',(req, res) =>{
  let id = req.params.id;
  let body = req.body;
  Producto.findByIdAndUpdate(id, body,{new:true, runValidators:true}, (err, productoDB) => {

    if (err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if (!productoDB){
      return res.status(400).json({
        ok:false,
        err
      })
    }

    res.json({
      ok:true,
      producto: productoDB
    })

  });


});
//=============================================
// Borrar producto
//=============================================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let cambiaEstado = {
      disponible:false
    };
    Producto.findByIdAndUpdate(id,cambiaEstado,{new:true},(err, productoBorrado)=>{
      if (err){
        return res.status(400).json({
          ok:false,
          err
        });
      }
      if (!productoBorrado){
        return res.status(400).json({
          ok: false,
          error:{
            message: 'Producto no encontrado'
          }
        });
      }
      res.json({
        ok:true,
        producto: productoBorrado
      })

    })
  });
module.exports = app;
