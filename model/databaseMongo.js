const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/chat?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexão Com o mongo sucedida.'))
  .catch((err) => console.log(err));

module.exports;