// THIS SCRIPT IS USED TO STORE USER DATA THAT WILL BE DISPLAYED ON MY ACOUNT PAGE.
// USING
// MONGODB (MONGOOSE)
// CONTAINS USERNAME, PHONE NUM, EMAIL, PASSWORD AND ADOPTED CATS.

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
