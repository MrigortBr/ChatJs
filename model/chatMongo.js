const mongoose = require('mongoose');

const Usuario = mongoose.Schema({   
    name: {type: String, unique: true}, 
    users: {type: Array, required: true}, 
    chatHistory: {type: Array, required: true}} 
);

const UsuarioModel = mongoose.model("usuarios", Usuario);

module.exports = UsuarioModel
