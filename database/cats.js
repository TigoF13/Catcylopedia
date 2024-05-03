// THIS SCRIPT IS USED TO STORE CAT DATA THAT HAS BEEN ADDED BY THE ADMIN.
// USING 
// MONGODB ATLAS (MONGOOSE)
// CONTAINS NAME, BREED, AGE, GENDER, COLOR, INTAKE DATE AND ADOPTED STATUS.

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Jason:12345@catcyclopedia.bjdmtgw.mongodb.net/');

const CatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    color: { type: String, required: true },
    intakeDate: { type: String, required: true },
    image: {
        data: Buffer,
        contentType: String
    },
    adopted: { type: Boolean, default: false }
});

const Cats = mongoose.model('Cats', CatSchema);

module.exports = Cats;
