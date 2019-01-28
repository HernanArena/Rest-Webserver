require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname , '../public')))

//config global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB,(err, res)=>{
  if (err) throw err;
  console.log(`Base de dato ONLINE en el puerto: ${27017}`);
});
app.listen(process.env.PORT,()=>{
  console.log(`Escuchando el puerto: ${process.env.PORT}`);
})
//Client ID
//105553624863-tt9olv6c943f6ek0qkoa7l4g8c0bbra5.apps.googleusercontent.com
//Client Secret
//l6hOK8QQytewiQY7lXeOB63P
