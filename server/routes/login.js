const express = require('express');

const app = express();

const Usuario = require('../models/usuario');

const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login',(req, res)=>{
  let body = req.body;
  Usuario.findOne({email: body.email},(err, usuarioDB)=>{
    if (err){
      return res.status(500).json({
        ok:false,
        err
      })
    }
    if (!body.password || !body.email) {
       return res.status(412).json({
           ok: false,
           err: {
               message: "Parametros incompletos."
           }
       });
   }
    if(!usuarioDB){
      return res.status(400).json({
        ok:false,
        err:{
          message: '(Usuario) o contraseña incorrectos'
        }
      })
    }
    if(!bcrypt.compareSync(body.password,usuarioDB.password)){
      return res.status(400).json({
        ok:false,
        err: {
          message: 'Usuario o (contraseña) incorrectos'
        }
      })
    }
    let token = jwt.sign({
      usuario:usuarioDB
    },process.env.SEED ,{expiresIn:process.env.CADUCIDAD_TOKEN});

    res.json({
      ok:true,
      usuario:usuarioDB,
      token
    });
  })

});

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google:true
  }
}
//verify().catch(console.error);

app.post('/google',async (req, res)=>{
  let token = req.body.idtoken;
  let googleUser = await verify(token)
  .catch(e =>{
    return res.status(403).json({
      ok:false,
      err: e
    });
  });
  Usuario.findOne({email: googleUser.email},(err, usuarioDB)=>{
    if (err){
      return res.status(500).json({
        ok:false,
        err
      })
    }
    if(usuarioDB){
      if(usuarioDB.google === false){
        return res.status(400).json({
          ok:false,
          err:{
            message: 'Debe de usar su autenticación normal'
          }
        });
      }else{
        let token = jwt.sign({
          usuario: usuarioDB
        }, process.env.SEED,{expiresIn:process.env.CADUCIDAD_TOKEN});
        return res.json({
          ok:true,
          usuario: usuarioDB
        });
      }
    } else {
        let usuario = new Usuario();
        usuario.nombre = googleUser.nombre;
        usuario.email = googleUser.email;
        usuario.img = googleUser.img;
        usuario.google = true;
        usuario.password = ':)';

        usuario.save((err,usuarioDB)=>{
          if (err){
            return res.status(500).json({
              ok:false,
              err
            })
          }
          let token = jwt.sign({usuario: usuarioDB},process.env.SEED,{expiresIn:process.env.CADUCIDAD_TOKEN});
          return res.json({
            ok:true,
            usuario: usuarioDB
          });

        });
    }
  });
});
module.exports = app;
