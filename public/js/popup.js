let timeout = []

document.body.innerHTML += `<div class="popupDIV"></div>`

function showPopUp(message, type) {
    const popup = document.getElementsByClassName("popupDIV")[0]
    message = message[0].toUpperCase() + message.substring(1)
    const errorSvg = `<svg width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.25v1.5-1.5Zm0-15 10.5 19.5h-21L12 2.25Zm0 6v6-6Z"></path></svg>`
    const alertSvg = `<svg width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 15 9 21 22.5 3"></path></svg>`
    const svg = [errorSvg, alertSvg]
    const background = [["rgb(255, 0, 0);", "rgb(158, 15, 15);"], ["rgb(0, 255, 0)", "rgb(1, 136, 1)"]]
    if (document.getElementsByClassName("popup")[0] != undefined){
        clearTimeout(timeout[0])
        clearTimeout(timeout[1])
        popup.removeChild(document.getElementsByClassName("popup")[0])
        showPopUp(message, type)
    }else{
        const audio = new Audio('/audio/alert.mp4');
        audio.play()
        popup.innerHTML = `
        <div class="popup">
            <div class=background-popup style="background-color:${background[type][0]}">
                <div class="timer" style="background-color:${background[type][1]}"></div>
                <div class="icon-popup">
                    ${svg[type]}
                </div>
                <p class="popup-message">${message}</p>
            </div>
        </div>
        `
        timeout[0] = setTimeout(() => {


            document.getElementsByClassName("popup")[0].className += " leave"
        }, 500);
    
        timeout[1] = setTimeout(() => {
            hidePopUp() 
        }, 6000);
    }
}

function hidePopUp() {
    document.getElementsByClassName("popupDIV")[0].removeChild(document.getElementsByClassName("popup")[0])
}