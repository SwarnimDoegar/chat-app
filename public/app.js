window.addEventListener('load', function () {
    let socket = io(`http://${window.location.hostname}:3000`);
    let send = document.getElementById("sendBtn");
    let messageField = document.getElementById("messageInputField");
    let chatHistory = document.getElementById("chatHistory");
    socket.on('connect', function () {
        send.addEventListener('click', function () {
            let messageToBeSent = messageField.value;
            messageField.value = '';
            socket.emit('new_message', messageToBeSent);
            chatHistory.innerHTML += `<div class="sender"><p class = "sender-message">${messageToBeSent}</p></div><br>`;
        });
        socket.on('message', (data) => {
            if(data){
                chatHistory.innerHTML += `<div class="reciever">${data}</div><br>`;
            }
        });
    })
})