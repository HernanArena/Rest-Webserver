const express = require('express');

const app = express();

const { verificaToken,verificaAdmin_role } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');
//=============================================
// Devuelve todas las categorias
//=============================================

app.get('/categoria',verificaToken, (req, res)=>{

  Categoria.find({})
  .populate('usuario','nombre email')
  .exec((err, categorias)=>{
    if(err){
      return res.status(400).json({
      ok:false,
      err
      });
    }
    Categoria.count((err,conteo)=>{
      res.json({
        ok:true,
        categorias,
        cantidad: conteo
      })
    })
  });
});
//=============================================
// Devuelve una categoria por Id
//=============================================

app.get('/categoria/:id',verificaToken,(req,res)=>{
  let id = req.params.id;

  Categoria.findById(id, (err, categoriaDB) => {
    if(err){
      return res.status(400).json({
        ok:false,
        err
      });
    }
    res.json({
      ok:true,
      categoriaDB
    });
  });
});


//=============================================
// Crea una categoria nueva
//=============================================

app.post('/categoria',[verificaToken,verificaAdmin_role], (req, res)=>{
  let id = req.usuario._id
  let body = req.body;

  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: id
  });
  categoria.save( (err, categoriaDB)=>{
    if (err){
      return res.status(500).json({
        ok:false,
        err
      })
    }
    if (!categoriaDB){
      return res.status(400).json({
        ok:false,
        err
      })
    }
    res.json({
      ok:true,
      categoria:categoriaDB
    })
  })

});
//=============================================
// Actualiza una categoria nueva por su id
//=============================================

app.put('/categoria/:id',[verificaToken,verificaAdmin_role],(req, res)=>{
    let id = req.params.id;
    let body = req.body;
    Categoria.findByIdAndUpdate(id, body,{new:true, runValidators:true}, (err, categoriaDB) => {

      if (err){
        return res.status(500).json({
          ok:false,
          err
        });
      }
      if (!categoriaDB){
        return res.status(400).json({
          ok:false,
          err
        })
      }

      res.json({
        ok:true,
        categoria: categoriaDB
      })

    });

});
//=============================================
// Borra una categoría Fisicamente (solo admin)
//=============================================

app.delete('/categoria/:id',[verificaToken,verificaAdmin_role], (req,res)=>{
  let id = req.params.id;
  Categoria.findByIdAndRemove(id,(err, categoriaBorrada)=>{
    if (err){
      return res.status(400).json({
        ok:false,
        err
      });
    }
    if (!categoriaBorrada){
      return res.status(400).json({
        ok: false,
        error:{
          message: 'Categoria no encontrado'
        }
      });
    }
    res.json({
      ok:true,
      categoria: categoriaBorrada
    });

  });

})
module.exports = app;
