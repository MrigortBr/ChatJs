const session = require("express-session")


relogin = function relogin(req, res, next){
    console.log("sessions; " +req.sessionID)
    

    next()
}