const express = require("express");
const session = require("express-session")
const cors = require("cors");
const nodemon = require("nodemon")
const multer = require('multer');
const path = require("path")



const app = express()
const server = require("http").createServer(app);
const socketIo = require("socket.io")(server);
const bodyParser = require("body-parser");
const authenticate = require("./middleware/authenticate")

const fs = require("fs")




const chalk = require('chalk');

// Configurações do servidor
app.use(session({
    secret: "secretSession",
    cookie: { maxAge: 124000000000 },
}))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static("public"));
app.set("view engine", 'ejs');

//exports Banco
const connection = require("./model/databaseMysql");
const connectionMongo = require("./model/databaseMongo")
const user = require("./model/userSql")
const chat = require("./model/chatMongo");
const { find, where } = require("./model/chatMongo");
const { Sequelize } = require("sequelize");

//Minddleware
function relogin(req, res, next){
    user.findOne({
        where: {session: req.sessionID}
    }).then(result =>{
        if (result == null){
            res.redirect("/login")
        }else{
            next()
        }
    })
}

function autoLogin(req, res, next){
    user.findOne({
        where: {session: req.sessionID}
    }).then(result =>{
        if (result != null){
            res.redirect("/")
        }else{
            next()
        }
    })
}

//Upload
const storage = multer.diskStorage({
    destination:  function(req, file, cb){
        cb(null, "public")
    },
    filename: function(req, file, cb){
        cb(null, "images/"+req.session.name + path.extname(file.originalname))
    }
})
const upload = multer({storage})
app.post("/upload",  (req,res) =>{
    upload.single("file")(req, res, function(err) {
        if (err) {
            res.statusCode = 409
            res.send("imageInvalid")
        }else{
            user.create(
                {
                    nome: req.session.name,
                    email: req.session.email,
                    senha: req.session.password,
                    img: req.file.path.replace("public", ""),
                    socket: "disconnected",
                    session: "disconnected"
                }
            ).then(result =>{
                res.statusCode = 201
                res.send("")
            }).catch(result =>{
                res.statusCode = 404
                res.send(result.toString())
            })
        }
        
    });
})

app.get("/test", (req, res) =>{
    res.render("test")
})

app.get("/userNew", (req, res) =>{
    let {name, email, password} = req.query

    user.findOne(
        {where: {nome: name}}
    ).then(result =>{
        if (!result){
            req.session.name = name;
            req.session.email = email;
            req.session.password = password;
            res.statusCode = 204;
            res.send("");
        }else{
            res.statusCode = 406
            res.statusMessage = "usuario ja existe"
            res.send("");

        }

    })


})


// rotas para front
app.get("/login", autoLogin,(req, res) =>{
    res.render("login")
})

app.get("/", relogin, (req, res) =>{
    user.findOne({

        where: {session: req.sessionID},
    }).then(result =>{
        if (result){
            req.session.idUser = result.id
            req.session.name = result.nome
            req.session.img = result.img
            res.render("index", {user:{img: result.img, name: result.nome, id: req.session.idUser}})
        }else{
            res.send("");
        }
    })
})

app.get("/register", autoLogin,(req, res) =>{
    res.render("register")
})


// rotas operacionais
app.get("/login/user", (req, res) =>{
    const email = req.query.email;
    const password =req.query.password
    const socket = req.query.socket
    user.findOne({
        where: {email: email, senha: password},
    }).then(result =>{
        if (result){
            req.session.idUser = result.id
            req.session.name = result.nome
            req.session.img = result.img
            user.update(
            {socket: socket, session: req.sessionID},
            {where: {id: result.id}}).then(result =>{
                res.statusCode = 200;
                res.send("");
            })

        }else{
            res.statusCode = 404;
            res.send("");
        }
    })
})

app.get("/chat/contacts", (req, res) =>{
    let id = req.session.idUser;
    chat.find({users: {$in: id}}).then(result =>{
        let usersId = []
        let chats = []
        let resultData = [];
        result.forEach(chat =>{
            chats.push(chat)
            usersId.push(chat.users.find(c => c != id))
        })
        user.findAll(
            {where: {id: usersId}}
        ).then(result =>{
            result.forEach(user =>{
                user = user.dataValues
                resultData.push({id: user.id, name: user.nome, img: user.img, chat: chats.find(c => c.users.find(u => u == user.id)).name})
            })
            res.send(resultData)
        }).catch(err =>{
            res.send("Su404")
            res.statusCode = 404
        })

    }).catch(err =>{
        res.statusCode = 404
        res.send("Mc404")
    })


    
    
})

app.get("/newChat/newUser", (req, res) =>{
    const idUser = req.session.idUser;
    const idTo = parseInt(req.query.idTo);
    const nick = req.query.nick

    user.findOne({
        where: {id: idTo, nome: nick}
    }).then(result =>{
        if (result){
            let {img, nome, id} = result.dataValues
            res.json({img: img, name:nome, id:id})
        }else{
            res.statusCode = 404
            res.send("Mecc404")
        }
    }).catch(err =>{
        console.log(err)
        res.statusCode = 404
        res.send("SefC1404")
    })

})

app.get("/newChat/user", (req, res) =>{
    const idUser = req.session.idUser;
    const idTo = parseInt(req.query.idTo);
    const chatSend = req.query.chatName


    chat.findOne({users: {$all: [idTo, idUser]}}).then(result =>{
        if (result !== null){
            if (result.name == chatSend){
                res.statusCode = 200
                res.json(result)
            }else{
                res.statusCode = 404;
                res.send("McCS404")
            }
        }else{
            res.statusCode = 404;
            res.send("McNV404")
        }
    }).catch(err =>{
        console.log(err);
        res.statusCode = 404;
        res.send("McFC404")
    })

})

app.get("/connect/newChat", (req, res) =>{
    res.send(req.session.idUser.toString())
})

app.get("/exit", (req, res) =>{
    let id = req.session.idUser

    req.session.destroy()

    user.update({socket: "disconnected", session: "disconnected"}, {where: {id: id}}).then(r =>{
        res.send("")
    })

})

app.get("/validate", (req, res) =>{
    user.findOne({
        where: {email: req.params.email}
    }).then(res =>{
        if (res == null){
            res.statusCode = 200
            res.send("")
        }else{
            res.statusCode = 404
            res.send("error")
        }
    })
})




socketIo.on("connection", socket =>{
    let newSocket = socket.id
    let lastSocket = socket.handshake.query.lastSocket

    
    if (lastSocket !== null){
        user.update(
            {socket: newSocket},
            {where: {socket: lastSocket}})
    }


    socket.on("sendMessage", data =>{
        
        user.findOne({where: {socket: socket.id}}).then(resultUser =>{
            let newMessage = {
                text: data.result.text,
                date: data.result.date,
                sender: resultUser.dataValues.id,
                read: false
            }
            chat.findOne({users: {$all: [resultUser.id, data.chat.idTo]}, name: data.chat.name}).then(chatFinded =>{
                if (chatFinded != null){
                    chatFinded.chatHistory.push(newMessage);
                    chatFinded.save().then(r =>{
                        if (r !== null){
                            newMessage.chat = data.chat.name
                            user.findOne({
                                where: {id: data.chat.idTo}
                            }).then(result =>{
                                if (result.dataValues.socket !== undefined && result.dataValues.socket !== "disconnected"){
                                    socket.broadcast.emit(data.chat.name, newMessage);
                                    socketIo.sockets.sockets.get(result.dataValues.socket).emit("reloadContacts")
                                }
                            })
                        }
                    })
                }else{
                    chat.findOne({users: {$all: [resultUser.id, data.chat.idTo]}})
                        .then(resultChat =>{
                            if (resultChat == null){
                            let newChat ={
                                name: `${resultUser.id}to${data.chat.idTo}`,
                                users: [resultUser.id,parseInt(data.chat.idTo)],
                                chatHistory: []}
                            newChat.chatHistory.push(newMessage)
                            chat.create(newChat)
                            socket.emit("reloadContacts")
                            user.findOne({
                                where: {id: data.chat.idTo}
                            }).then(result =>{
                                if (result.dataValues.socket !== undefined && result.dataValues.socket !== "disconnected"){
                                    socketIo.sockets.sockets.get(result.dataValues.socket).emit("reloadContacts")
                                    socket.broadcast.emit(data.chat.name, newMessage);
                                }
                            })
                        }else{
                            res.statusCode = 204
                            res.json(resultChat)
                    }
                })
            }
        })
    })
})
  
    socket.on("readMessage", data =>{
        if (data){
            chat.updateMany(
                { "chatHistory.sender": data.sender , name: data.chat}, 
                { $set: { "chatHistory.$[elem].read": true } }, 
                { arrayFilters: [{ "elem.sender": data.sender}] })
                  .catch((err) => {
                    console.error(err);
            });
        }
    })

    socket.on('disconnect', () => {
        setTimeout(() => {
            user.update(
                {socket: "disconnected"},
                {where: {socket: socket.id}}).then(result =>{
                    if(result[0] == 1){
                        socket.emit(`${socket.id}Disconnect`)
                    }
                })
        }, 10000);
      });

})






server.listen(3030, () =>{
    user.update({socket: "disconnected", session: "disconnected"}, { where: {} })
    console.log(chalk.green("Servidor iniciado"))
})
