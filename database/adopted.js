const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Jason:12345@catcyclopedia.bjdmtgw.mongodb.net/')

const adoptedSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    streetAddress: String,
    city: String,
    region: String,
    postalCode: String,
    phone: String,
    email: String,
    catName: String,
    userId: mongoose.Schema.Types.ObjectId
});

const Adopted = mongoose.model('Adopted', adoptedSchema);

module.exports = Adopted;