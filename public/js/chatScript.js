const socket = io("http://localhost:3030", {query: {lastSocket: localStorage.getItem("socket")}});
let chats = [];
let actualChat = {}
let myId = null

function cancelBroadCast(chat){
    try {
        socket.leave(chat.name)
    } catch (error) {
        
    }
}

function exitChat(){
    document.getElementsByClassName('chat-background')[0].innerHTML = ""
    cancelBroadCast()
}

function leave(){
    $.ajax({
        url: "/exit",
        type: "get"
    }).done(res =>{
        window.location.href = "/login"
    })
}

function openNewChat(id, chat){
    cancelBroadCast()
    actualChat = {idTo: id, name: "new"}
    document.getElementsByClassName('chat-background')[0].innerHTML = `
    <div class="contact">
        <div class="contact-user">
            <img class="user-logo" src="${chat.img}" alt="">
            <span class="user-inf">
                <p class="user-name">${chat.name}</p>
                <p class="user-status">Online</p>
            </span>
        </div>
        <div class="contact-options">
            <svg class="options-close" onclick="exitChat()" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.343 17.657 17.657 6.344m-11.314 0 11.314 11.313L6.343 6.344Z"></path>
            </svg>
        </div>

    </div>
    <div class="chat">
        
    </div>
    <div class="input">
        <div class="input-background">
            <input type="text" onkeydown="keydownChat(event)" class="input-element" placeholder="Digite a mensagem que deseja enviar">
            <svg class="send-element" onclick="sendMessage()" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.368 11.998 3 21.606v-7.61l8-2-8-2.205v-7.4l18.368 9.607Z"></path>
            </svg>
        </div>
    </div>
    `
}

function openChat(id){
    const chat = chats.find(c => c.id == id);
    $.ajax({
        url: `http://localhost:3030/newChat/user`,
        type: 'get',
        data: {idTo: id, chatName: chat.chat},
        async: false,
    }).done(result =>{
        document.getElementsByClassName('chat-background')[0].innerHTML = `
        <div class="contact">
            <div class="contact-user">
                <img class="user-logo" src="${chat.img}" alt="">
                <span class="user-inf">
                    <p class="user-name">${chat.name}</p>
                    <p class="user-status">Online</p>
                </span>
            </div>
            <div class="contact-options">
                <svg class="options-close" onclick="exitChat()" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.343 17.657 17.657 6.344m-11.314 0 11.314 11.313L6.343 6.344Z"></path>
                </svg>
            </div>

        </div>
        <div class="chat">
            
        </div>
        <div class="input">
            <div class="input-background">
                <input type="text" onkeydown="keydownChat(event)" class="input-element" placeholder="Digite a mensagem que deseja enviar">
                <svg class="send-element" onclick="sendMessage()" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.368 11.998 3 21.606v-7.61l8-2-8-2.205v-7.4l18.368 9.607Z"></path>
                </svg>
            </div>
        </div>
        `


        actualChat = {idTo: parseInt(id), name: result.name}
        socket.on(result.name, (data) =>{
            if(data.chat == actualChat.name){
                let arr = [data]
                renderMessage(arr)
                socket.emit("readMessage", data)
            }
        })

        socket.emit("readMessage", {chat: actualChat.name, sender: actualChat.idTo})

        renderMessage(result.chatHistory);
    }).fail(err =>{
        showPopUp("Erro ao Abrir o chat, tente refazer o login ou contacte o suporte. codigo do erro:"+ err.responseText,0)
    })
}

function keydownChat(event){
    if (event.key == "Enter"){
        sendMessage()
    }
}

function sendMessage(){



    let textValue = document.getElementsByClassName("input-element")[0].value
    if (textValue !== ""){
        socket.emit("sendMessage", {result:{text: textValue, date: new Date(), sender: myId, read: false}, chat: actualChat})
        let arr = [{text: textValue, date: new Date()}]
        renderMessage(arr)
    }
    

    if (actualChat.name == "new"){
        $.ajax({
            url: "/connect/newChat",
            method: "GET",
        }).done(result =>{
            if (result !== undefined){
                actualChat.name = result+"to"+actualChat.idTo
                socket.on(actualChat.name, (data) =>{
                    if(data.chat == actualChat.name){
                        let arr = [data]
                        renderMessage(arr)
                        socket.emit("readMessage", data)
                    }
                })

            }
        })
    }
}

function renderMessage(messageElement){
    let chat = document.getElementsByClassName("chat")[0]
    messageElement.forEach(element => {
        let date = new Date(element.date)
        let hours = `${ date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
        if (element.sender == actualChat.idTo){
            chat.innerHTML += `
            <div class="recived">
                <p class="recived-text">${element.text}</p>
                <p class="recived-time">${hours}</p>
            </div>`
        }else{
            chat.innerHTML += `
            <div class="send">
                <p class="send-time">${hours}</p>
                <p class="send-text">${element.text}</p>
            </div>`
        }
    });
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;

    
}

function reloadContacts(){
    $.ajax({
        url: `http://localhost:3030/chat/contacts`,
        type: 'get',
        async: false,
    }).done(result =>{
        try {
            document.getElementsByClassName("agend-contacts")[0].removeChild(document.getElementsByClassName("load")[0])
        } catch (error) {
            
        }
        chats = result;
        document.getElementsByClassName("agend-contacts")[0].innerHTML = ""
        result.forEach(element => {
            document.getElementsByClassName("agend-contacts")[0].innerHTML += `
        <div class="agend-contacts-contact" id="${element.id}" onclick="openChat('${element.id}', this)">
            <div class="agend-contacts-information">
                <img src="${element.img}" alt="" class="contacts-logo">
                <p class="agend-contacts-name">${element.name}</p>
            </div>
        </div>
        `
        }); 
    }).fail(err =>{
        showPopUp("Erro ao listar chats tente refazer o login ou contacte o suporte. codigo do erro:"+ err.responseText,0)
    })
}

socket.on("reloadContacts", data =>{
    reloadContacts()      
  })

socket.on("test", r =>{
    alert("oi")
})

reloadContacts()


setInterval(() => {
    if(socket.id){
        localStorage.setItem("socket", socket.id)
        clearInterval(this)
    }
}, 100);




