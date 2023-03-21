const chat = document.getElementsByClassName('chat-background')[0]
const elementContact = document.getElementsByClassName("agend-contacts")[0]

const socket = io("http://localhost:3030");
let sala = {}
let imgContact = ""
let nameContact = ""



function openChat(idTo, elementFather){
    imgContact = elementFather.children[0].children[0].src
    nameContact = elementFather.children[0].children[1].innerText
    $.ajax({
        url: `http://localhost:3030/newChat/user`,
        type: 'get',
        data: {idTo: idTo},
        async: false,
    }).done(result =>{
        console.log(result)
        chat.innerHTML = `
        <div class="contact">
            <div class="contact-user">
                <img class="user-logo" src="${imgContact}" alt="">
                <span class="user-inf">
                    <p class="user-name">${nameContact}</p>
                    <p class="user-status">Online</p>
                </span>
            </div>
            <div class="contact-options">
                <svg class="options-close" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.343 17.657 17.657 6.344m-11.314 0 11.314 11.313L6.343 6.344Z"></path>
                </svg>
            </div>

        </div>
        <div class="chat">
            
        </div>
        <div class="input">
            <div class="input-background">
                <input type="text" class="input-element" placeholder="Digite a mensagem que deseja enviar">
                <svg class="send-element" onclick="enviarMensagem()" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.368 11.998 3 21.606v-7.61l8-2-8-2.205v-7.4l18.368 9.607Z"></path>
                </svg>
            </div>
        </div>
        `
        try{
            socket.off(sala.name)
        }catch(err){
            console.log(err)
        }
        sala = result
        result.chatHistory.forEach(element => {
        let date = new Date(element.date)
        let hours = `${ date.getHours().toString().padStart(2, "0")}:${date.getMinutes()}`
            if (element.user == idTo){
                document.getElementsByClassName("chat")[0].innerHTML += `
                <div class="recived">
                    <p class="recived-text">${element.text}</p>
                    <p class="recived-time">${hours}</p>
                </div>`
            }else{
                
                document.getElementsByClassName("chat")[0].innerHTML += `
                <div class="send">
                    <p class="send-time">${hours}</p>
                    <p class="send-text">${element.text}</p>
                </div>`
            }
        });
        entrarNaSala()

    })
}

function renderMyMensage(result){
    let date = new Date()
    let hours = `${ date.getHours().toString().padStart(2, "0")}:${date.getMinutes()}`
    document.getElementsByClassName("chat")[0].innerHTML += `
        <div class="send">
            <p class="send-time">${hours}</p>
            <p class="send-text">${result.text}</p>
        </div>
    `
}

function renderHeMensage(result){
    document.getElementsByClassName("chat")[0].innerHTML += `
        <div class="recived">
            <p class="recived-text">${result.text}</p>
            <p class="recived-time">22:45</p>

        </div>
    `
}

function enviarMensagem(){
    let text = document.getElementsByClassName("input-element")[0].value
    $.ajax({
        url: `http://localhost:3030/chat/message`,
        type: 'get',
        data: {sala: sala.name, text: text},
        async: false,
    }).done(result =>{
        socket.emit("enviarMesagem", {sala: sala.name, text: text})
        renderMyMensage({user: "you", text: text})  
    })
}


function entrarNaSala(){
    socket.on(sala.name, (result) =>{
        renderHeMensage(result)
    })
}

function add(id){
    $.ajax({
        url: `http://localhost:3030/chat/new`,
        type: 'get',
        data: {id: id},
        async: false,
    });

    reloadContacts();
}

function reloadContacts(){
    $.ajax({
        url: `http://localhost:3030/chat/contacts`,
        type: 'get',
        async: false,
    }).done(result =>{
        elementContact.innerHTML = ""
        result.friends.forEach(element => {
            elementContact.innerHTML += `
            <div class="agend-contacts-contact" onclick="openChat('${element.id}', this)">
                <div class="agend-contacts-information">
                    <img src="${element.img}" alt="" class="contacts-logo">
                    <p class="agend-contacts-name">${element.nome}</p>
                </div>
            </div>
            `
        });
    })
}

document.body.onload = reloadContacts