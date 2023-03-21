
const socket = io("http://localhost:3030", {query: {lastSocket: localStorage.getItem("socket")}});


function login(){
    const email = document.getElementsByClassName("login-input")[0].value
    const password = document.getElementsByClassName("login-input")[1].value

    if (email !== "" && password !== ""){
        const params = {email: email, password: password, socket: socket.id}
        $.ajax({
            url: `http://localhost:3030/login/user`,
            type: 'get',
            data: params,
            async: false,
        }).done(result =>{
            window.location.href = "/"
        }).fail(result =>{
            console.log(result)
            showPopUp("Email ou senha invalidos", 0)
        })
    }else{
        showPopUp("preencha todos os campos",0)
    }
}

setInterval(() => {
    if(socket.id){
        localStorage.setItem("socket", socket.id)
        clearInterval(this)
    }else{
        console.log("nao criado")
    }
}, 100);
