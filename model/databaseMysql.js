//Importando o sequelize
const Sequelize = require("sequelize");

//Conectando ao banco
const connection = new Sequelize("chatJS", "root", "", {
    host: "localhost",
    dialect: "mysql",
    timezone: "-03:00"
})



//Exportando connection
module.exports = connection;
