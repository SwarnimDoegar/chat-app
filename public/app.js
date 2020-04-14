console.log("hello")
window.addEventListener('load', async function () {
    let send = document.getElementById("sendBtn");
    let messageField = document.getElementById("messageInputField");
    let chatHistory = document.getElementById("chatHistory");
    let socket = io(`http://${window.location.hostname}:3000`);
    chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;

    let userContacts = await this.fetch('/getContactPane').then((data) => data.json());
    let contacts = document.getElementsByClassName("contact");
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].addEventListener("click", function (e) {
            const userId = userContacts[i].chatting_with.user_handle;
            console.log(userId);
        })
    }

    //for ctrl+enter is send
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.keyCode == 13) {
            send.click();
            chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
        }
    });

    let user = await this.fetch('/getUser').then((data) => data.text());

    socket.emit('establish', user, socket.id);
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

window.addEventListener('beforeunload', async function (e) {
    e.preventDefault();
    var request = new XMLHttpRequest();
    request.open('GET', '/session/destroy');  // `false` makes the request synchronous
    request.send(null);
    return undefined;
}
)
