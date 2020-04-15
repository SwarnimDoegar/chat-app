window.addEventListener('load', async function () {
    let send = document.getElementById("sendBtn");
    let messageField = document.getElementById("messageInputField");
    let chatHistory = document.getElementById("chatHistory");
    let socket = io(`http://${window.location.hostname}:3000`);


    let userContacts = await this.fetch('/getContactPane').then((data) => data.json());
    let contacts = document.getElementsByClassName("contact");
    let user = await this.fetch('/getUser').then((data) => data.text());
    let activeChat = null;
    let chatsWithContacts = {};
    chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].addEventListener("click", async function (e) {
            const userId = userContacts[i].chatting_with.user_handle;
            messageField.value = "";
            activeChat = userId;
            let chats;
            if (!(userId in chatsWithContacts)) {
                chats = await fetch(`/getChats/?u1=${user}&u2=${userId}`).then(data => data.json());
                chatsWithContacts[userId] = chats.chatting_with[0].messages;
            }
            if (userId in chatsWithContacts) {
                let html = ejs.render(`<% chats.forEach((elem) => {%>
                            <%if (elem.from == user){%>
                                <div class="sender">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    <div class="read"><%=elem.read%></div>
                                    </div>
                                </div>
                            <%}else{%>
                                <div class="reciever">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    </div>
                                </div>
                            <%}%>
                        <%}) %>`,
                    { chats: chatsWithContacts[userId], user: user });
                chatHistory.innerHTML = null;
                chatHistory.innerHTML = html;
            }

        })
    }

    //for ctrl+enter is send
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.keyCode == 13) {
            send.click();
            chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
        }
    });


    socket.emit('establish', user, socket.id);
    send.addEventListener('click', function () {
        let message = messageField.value;

        if (message !== "" && activeChat != null) {
            messageField.value = '';
            let messageToBeSent = {
                from: user,
                to: activeChat,
                message: message
            }
            socket.emit('new_message', messageToBeSent);
            chatsWithContacts[activeChat].push({
                read: false,
                from: user,
                message: message,
                chat_date_time: Date.now()
            })
            let html = ejs.render(`<% chats.forEach((elem) => {%>
                            <%if (elem.from == user){%>
                                <div class="sender">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    <div class="read"><%=elem.read%></div>
                                    </div>
                                </div>
                            <%}else{%>
                                <div class="reciever">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    </div>
                                </div>
                            <%}%>
                        <%}) %>`,
                { chats: chatsWithContacts[activeChat], user: user });
            chatHistory.innerHTML = html;
            chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
        }
    });
    socket.on('message', (data) => {
        if (data) {
            chatsWithContacts[data.from].push(data);
            if (activeChat == data.from) {
                let html = ejs.render(`<% chats.forEach((elem) => {%>
                            <%if (elem.from == user){%>
                                <div class="sender">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    <div class="read"><%=elem.read%></div>
                                    </div>
                                </div>
                            <%}else{%>
                                <div class="reciever">
                                    <div class="message"><%=elem.message%></div>
                                    <div class="timeAndRead">
                                    <%let date= Date(elem.chat_date_time).toLocaleUpperCase().slice(16, 21)%>
                                    <div class="time"><%=date%></div><br>
                                    </div>
                                </div>
                            <%}%>
                        <%}) %>`,
                    { chats: chatsWithContacts[activeChat], user: user });
                chatHistory.innerHTML = html;
            }
            chatHistory.scrollTop = chatHistory.scrollHeight - chatHistory.clientHeight;
        }
    });
})

window.addEventListener('beforeunload', function (e) {
    this.navigator.sendBeacon('/session/destroy', "destroy")
})

