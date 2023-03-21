const Sequelize = require("sequelize");
const connection = require("./databaseMysql");

const user = connection.define('users', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    img: {
        type: Sequelize.STRING,
        allowNull: false,
        default: "images/noImage.svg"
    },
    socket: {
        type: Sequelize.STRING,
        allowNull: false,
        default: "disconnected"
    },
    session: {
        type: Sequelize.STRING,
        allowNull: false,
        default: "disconnected"
    }
})

user.sync({force: false});

module.exports = user;