const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Jason:12345@catcyclopedia.bjdmtgw.mongodb.net/')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    adoptedcats: {
        type: Array,
        required: false
    }
});

const UserData = mongoose.model('User', userSchema);

module.exports = UserData;
