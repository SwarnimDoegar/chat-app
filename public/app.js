window.addEventListener('load', function () {
    let socket = io(`http://${window.location.hostname}:3000`);
    let send = document.getElementById("sendBtn");
    let messageField = document.getElementById("messageInputField");
    let chatHistory = document.getElementById("chatHistory");
    chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
    window.onbeforeunload = function (e) {
        fetch("/session/destroy").then(response => {
        })
    }
    //for ctrl+enter is send
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.keyCode == 13) {
            send.click();
            chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
        }
    });
    window.onload = function (e) {

    }
    socket.on('connect', function () {
        send.addEventListener('click', function () {
            let messageToBeSent = messageField.value;
            messageField.value = '';
            if (messageToBeSent !== "") {
                socket.emit('new_message', messageToBeSent);
                chatHistory.innerHTML += `<div class="sender"><p class = "sender-message">${messageToBeSent}</p></div><br>`;
                chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
            }
        });
        socket.on('message', (data) => {
            if (data) {
                chatHistory.innerHTML += `<div class="reciever">${data}</div><br>`;
                chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
            }
        });
    })
})

// let sender=document.querySelector(".sender");
// let reciever=document.querySelector(".reciever");

// sender.style.marginLeft  = 100-sender.style.widht;
// sender.style.marginRight  = 100-receiver.style.widht;