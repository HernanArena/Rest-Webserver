const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let rolesValidos = {
  values:['ADMIN_ROLE','USER_ROLE'],
  message:'{VALUE} no es un rol válido'
}
let usuarioSchema = new Schema({
  nombre: {
    type:String,
    required: [true, 'El nombre es obligatorio']
  },
  email:{
    type:String,
    unique:true,
    required:[true, 'El correo es necesario']
  },
  password: {
    type:String,
    required:[true, 'La contraseña es obligatoria']
  },
  img:{
    type:String,
    required: false
  },
  role:{
    type:String,
    default:'USER_ROLE',
    required:true,
    enum: rolesValidos
  },
  estado:{
    type:Boolean,
    default: true,
    required: false
  },
  google:{
    type:Boolean,
    default:false,
    required:false
  }
});
usuarioSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
usuarioSchema.plugin(uniqueValidator,{message:'{PATH} debe de ser único'})
module.exports = mongoose.model('Usuario',usuarioSchema);
