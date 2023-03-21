document.body.innerHTML += `<div class="addDIV"> </div>`
const addDiv = document.getElementsByClassName("addDIV")[0]

function addContact(){
    const nickElement = document.getElementById("nick");
    const idElement = document.getElementById("id");
    let nick = nickElement.value
    let id = idElement.value

    if (nick != "" && id != ""){
        $.ajax({
            url: `http://localhost:3030/newChat/newUser`,
            type: 'get',
            data: {idTo: id, nick: nick},
            async: false,
        }).done(res =>{
            openNewChat(id, res)
            showPopUp("Novo contato adicionado", 1)
            closeAdd()
        }).fail(err =>{
            console.log(err)
            showPopUp("Usuario nao encontrado", 0)
        })
    }else{
        showPopUp("Preencha todos os campos", 0)
    }
}
function closeAdd(){
    const addElement = document.getElementsByClassName("add")[0];

    addElement.className += " leaveAdd"

    document.body.onkeydown = ""

    setTimeout(() => {
        addDiv.removeChild(addElement) 
    }, 600);

}
function keyAdd(event, element){
    let key = event.key

    if (key == "Escape"){
        closeAdd()
    }

    if (element){
        if(key == "Enter"){
            addContact()
        }
    }
}
function openAdd(){
    addDiv.innerHTML += `
    <div class="add">
        <div class="add-background">
            <p class="add-text">Adicionar Contato</p>
            <div class="inputs">
                <input type="text" class="add-input" id="nick" onkeydown="keyAdd(event, this)" placeholder="nome do usuario">
                <input type="text" class="add-input" id="id" onkeydown="keyAdd(event, this)" placeholder="ID">

            </div>
            <div class="buttons">
                <button class="add-bt" onclick="addContact()">Adicionar</button>
                <button class="add-bt" onclick="closeAdd()">Fechar</button>
            </div>
        </div>
    </div>
    `

    document.body.onkeydown = keyAdd

}