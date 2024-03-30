const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/userdata')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

UserData = mongoose.model('User', userSchema);

module.exports = UserData;
