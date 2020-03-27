let mongoose = require('mongoose');
let sha512 = require('js-sha512').sha512;
let connection = mongoose.connect('mongodb://127.0.0.1:27017/chat-app?gssapiServiceName=mongodb', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
let userSchema = mongoose.Schema({
    user_handle: { type: String, required: true },
    user_pass: { type: String, required: true },
    user_name: { type: String, required: true },
    socket_id: { type: String, default: "offline" },
    dp_link: { type: String, default: "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" }
})
let chatSchema = mongoose.Schema({
    from: String,
    chat_date_time: { type: Date, default: new Date() },
    message: { type: String, required: true },
    read_or_not: Boolean
})

let chatTableSchema = mongoose.Schema({
    user_handle: { type: String, required: true },
    chatting_with: {
        user_handle: { type: String, required: true },
        messages: [chatSchema]
    }
})
let userCheckModel = mongoose.model('User', userSchema);

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
    let user_doc = {
        user_handle: String(user_handle),
        user_pass: sha512(user_pass),
        user_name: String(user_name),
    }
    if (userexists) {
        if (!socket_id || !dp_link)
            return
        let updated_user = {
            user_handle: String(user_handle),
            user_pass: sha512(user_pass),
            user_name: String(user_name),
            socket_id: String(socket_id),
            dp_link: String(dp_link)
        }
        let doc = await userModel.findOneAndUpdate({ user_handle: String(user_handle) }, updated_user);
        return true;
    }
    let new_user = new userModel(user_doc);
    let validated = await new_user.save();
}

async function loginUser(user_handle, user_pass) {
    if (!user_handle || !user_pass)
        return false
    user_handle = String(user_handle)
    user_pass = sha512(user_pass)
    let count = await userCheckModel.find({ user_handle: user_handle, user_pass: user_pass }).countDocuments();
    if (count) {
        console.log("logged in");
        return true
    }
}

// async function updateSocketId(user_handle, socket_id)
makeUser("fd", "sdfg", "sdfg", "xyx", "fcgvhbjk");
loginUser("fd", "sdfg");
module.exports = {
    makeUser,
    loginUser,
    chatTableSchema,
    chatSchema,
    userSchema,
    userCheckModel
}