let mongoose = require('mongoose');
let randomString = require('randomstring');
let sha512 = require('js-sha512').sha512;
mongoose.connect('mongodb://127.0.0.1:27017/chat-app?gssapiServiceName=mongodb', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
let userSchema = mongoose.Schema({
    user_handle: { type: String, required: true },
    user_pass: { type: String, required: true },
    user_name: { type: String, required: true },
    socket_id: { type: String, default: "offline" },
    dp_link: { type: String, default: "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" },
    online: { type: Boolean, required: true, default: false },
})
let chatSchema = mongoose.Schema({
    from: { type: String, required: true },
    chat_date_time: { type: Date, default: Date.now, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
})

let chatTableSchema = mongoose.Schema({
    user_handle: { type: String, required: true },
    chatting_with: [{
        user_handle: { type: String },
        messages: [chatSchema]
    }]
})
let chatTableModel = mongoose.model("Chats", chatTableSchema);
let userCheckModel = mongoose.model('User', userSchema);
let chatModel = mongoose.model('', chatSchema);


/*Utility functions for users collection*/

async function doesUserExist(user_handle) {
    let userexists = await userCheckModel.exists({ user_handle: String(user_handle) });
    if (userexists)
        return true
    return false
}

async function makeUser(user_handle, user_pass, user_name, socket_id, dp_link) {
    if (!user_handle || !user_pass || !user_name)
        return false
    let userModel = mongoose.model('User', userSchema);
    let userexists = await doesUserExist(user_handle);
    if (userexists) {
        return false;
    }
    let user_doc = {
        user_handle: String(user_handle),
        user_pass: sha512(user_pass),
        user_name: String(user_name),
    }
    let new_user = new userModel(user_doc);
    let chatTableEntry = new chatTableModel({ user_handle: String(user_handle) });
    chatTableEntry.save();
    await new_user.save();
    return true;
}

async function loginUser(user_handle, user_pass) {
    if (!user_handle || !user_pass)
        return false
    user_handle = String(user_handle)
    user_pass = sha512(user_pass)
    let doc = await userCheckModel.find({ user_handle: user_handle, user_pass: user_pass });
    if (doc.length == 1) {
        let new_doc = {}
        new_doc.user_handle = doc[0].user_handle;
        new_doc.user_name = doc[0].user_name;
        return new_doc
    }
    return false;
}


async function updateSocketId(user_handle, socket_id) {
    if (!user_handle || !socket_id)
        return false
    let doc = await userCheckModel.findOneAndUpdate({ user_handle: String(user_handle) }, { socket_id: String(socket_id) })
    return true;
}
async function fetchSocketId(user_handle) {
    if (!user_handle)
        return false;
    let doc = await userCheckModel.find({ user_handle: String(user_handle) }, { socket_id: 1, _id: 0 });
    if (doc.length == 1) {
        return doc[0].socket_id;
    }
}
async function updateDpLink(user_handle, dp_link) {
    if (!user_handle || !dp_link)
        return false
    await userCheckModel.findOneAndUpdate({ user_handle: String(user_handle) }, { dp_link: String(dp_link) })
    return true;
}

async function getUserDetails(user_handle) {
    if (!user_handle)
        return false
    let doc = await userCheckModel.findOne({ user_handle: String(user_handle) }, { _id: 0, user_pass: 0, __v: 0 });
    if (doc)
        return doc;
    else return false
}

async function setOnline(user_handle, val) {
    if (!user_handle)
        return false;
    await userCheckModel.findOneAndUpdate({ user_handle: String(user_handle) }, { online: Boolean(val) })
    return true;
}
async function checkOnline(user_handle) {
    if (!user_handle)
        return false;
    const doc = await userCheckModel.findOne({ user_handle: String(user_handle) });
    if (doc)
        return doc.online;
}


/*Utility functions for chats collection*/

async function createChatObject(from, message, read) {
    if (!from || !message)
        return false
    let chat_entry = {
        from: String(from),
        chat_date_time: String(Date.now()),
        message: String(message),
        read: Boolean(read)
    }

    return chat_entry;
}

async function appendChat(user_handle, user_handle_chatting_with, from, message, read) {
    if (!user_handle || !user_handle_chatting_with || !from || !message)
        return false;

    if (from != user_handle && from != user_handle_chatting_with)
        return "Invalid <from> argument"
    let test = await chatTableModel.find({
        user_handle: {
            $in: [user_handle_chatting_with, user_handle]
        }
    })
    if (test.length != 2)
        return false

    let doc = await chatTableModel.find({
        user_handle: String(user_handle),
        "chatting_with.user_handle": String(user_handle_chatting_with)
    })

    if (doc.length == 0) {
        let new_doc = await chatTableModel.find({
            user_handle: String(user_handle)
        })
        if (new_doc.length == 1) {
            new_doc[0].chatting_with.push({ user_handle: String(user_handle_chatting_with) })
            await new_doc[0].save();
        }
        else
            return false
    }

    doc = await chatTableModel.find({
        user_handle: String(user_handle),
        "chatting_with.user_handle": String(user_handle_chatting_with)
    }, {
        chatting_with: {
            $elemMatch: { user_handle: String(user_handle_chatting_with) }
        }
    });
    let chatObj = await createChatObject(from, message, read);
    if (doc.length == 1) {
        doc[0].chatting_with[0].messages.push(chatObj);
        doc[0].save()
    }


    //For Second User

    doc = await chatTableModel.find({
        user_handle: String(user_handle_chatting_with),
        "chatting_with.user_handle": String(user_handle)
    })
    if (doc.length == 0) {
        new_doc = await chatTableModel.find({
            user_handle: String(user_handle_chatting_with)
        })
        if (new_doc.length == 1) {
            new_doc[0].chatting_with.push({ user_handle: String(user_handle) })
            await new_doc[0].save();
        }
        else
            return false
    }
    doc = await chatTableModel.find({
        user_handle: String(user_handle_chatting_with),
        "chatting_with.user_handle": String(user_handle)
    }, {
        chatting_with: {
            $elemMatch: { user_handle: String(user_handle) }
        }
    })
    if (doc.length == 1) {
        doc[0].chatting_with[0].messages.push(chatObj);
        doc[0].save()
    }
    return true
}

async function setRead(user_handle, user_handle_chatting_with) {
    if (!user_handle || !user_handle_chatting_with)
        return false
    let temp = await chatTableModel.find({
        user_handle: String(user_handle)
    }, {
        "chatting_with": 1
    })
    temp.forEach(function (i) {
        i.chatting_with.forEach(function (j) {
            if (j.user_handle === user_handle_chatting_with) {
                for (let k = j.messages.length - 1; k >= 0; k--) {
                    if (!j.messages[k].read)
                        j.messages[k].read = true;
                    else
                        break
                }
            }
        })
        i.save();
    });
}

async function fetchContactPaneDetails(user_handle) {
    if (!user_handle)
        return false
    let doc = await chatTableModel.aggregate([
        {
            '$match': {
                'user_handle': user_handle
            }
        }, {
            '$unwind': {
                'path': '$chatting_with'
            }
        }, {
            '$project': {
                'chatting_with.user_handle': 1,
                'last_message': {
                    '$arrayElemAt': [
                        '$chatting_with.messages', -1
                    ]
                },
                '_id': 0
            }
        }, {
            '$sort': {
                'last_message.chat_date_time': -1
            }
        }, {
            '$project': {
                'last_message._id': 0
            }
        }
    ])
    const promises = doc.map(async function (elem) {
        let user = await userCheckModel.findOne({ user_handle: String(elem.chatting_with.user_handle) }, { _id: 0, dp_link: 1, user_name: 1 });
        let new_doc = {
            chatting_with: elem.chatting_with,
            last_message: elem.last_message,
            dp_link: user.dp_link,
            user_name: user.user_name
        }
        return new_doc;
    })
    let retdoc = await Promise.all(promises);
    return retdoc;
}

async function getChatsBetween(user_handle1, user_handle2) {
    let doc = await chatTableModel.findOne({
        user_handle: String(user_handle1),
        "chatting_with.user_handle": String(user_handle2)
    }, {
        _id: 0,
        __v: 0,
        chatting_with: {
            $elemMatch: {
                user_handle: String(user_handle2)
            }
        },
        "chatting_with._id": 0,
        "chatting_with.messages._id": 0,

    })
    return doc;
}

// async function initiate() {
//     await makeUser('@vtrix', 'password123', 'vivek');
//     await makeUser('@delta', 'password123', 'swarnim');
//     await appendChat('@vtrix', '@delta', '@delta', 'Hello');
//     await appendChat('@vtrix', '@delta', '@vtrix', 'Hello');
//     await appendChat('@vtrix', '@delta', '@delta', 'How are you?');
// }
// initiate();


module.exports = {
    sha512,
    makeUser,
    loginUser,
    doesUserExist,
    updateSocketId,
    fetchSocketId,
    updateDpLink,
    setOnline,
    checkOnline,
    createChatObject,
    appendChat,
    setRead,
    fetchContactPaneDetails,
    getChatsBetween,
    getUserDetails,
    chatTableSchema,
    chatSchema,
    userSchema,
    randomString,
    userCheckModel,
    chatTableModel,
    chatModel
}