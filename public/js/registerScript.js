function register(){
    const name = document.getElementsByName("name")[0].value
    const password = document.getElementsByName("password")[0].value
    const email = document.getElementsByName("email")[0].value
    const image = document.getElementsByName("file")[0].files[0];
    console.log(email)
    if (name.replaceAll(" ", "") !== "" && email.replaceAll(" ", "") !== "" && password.replaceAll(" ", "") !== "" && name !== undefined && email !== undefined && password !== undefined && image !== undefined){
        $.ajax({
            url: "/userNew",
            data: {name: name, password: password, email: email},
            method: "get",
        }).done(result =>{
            let formData = new FormData()
            formData.append('file', image)

                $.ajax({
                    url: "/upload",
                    method: "POST",
                    processData: false,
                    contentType: false,
                    data: formData
                }).done(res =>{
                    document.location.href = "/"
                }).fail(res =>{
                    showPopUp("imagem invalida  ", 0)
                })
        }).fail(result =>{
            showPopUp("Dados ja cadastrados", 0)
        })

    }else{
    showPopUp("preencha todos os dados", 0)
}
}

function openImages(){
    document.getElementsByName("file")[0].click()
}

function readImage(){
    const input = document.getElementById('file');
    const preview = document.getElementsByClassName('photo-information-register')[0];
    const file = input.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
    }

}