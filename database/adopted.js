// THIS SCRIPT IS USED TO STORE DATA OF PEOPLE WHO HAVE ADOPTED CATS ON THE CATCYCLOPEDIA WEBSITE.
// USING 
// MONGODB ATLAS (MONGOOSE)
// CONTAINS FIRST NAME, LAST NAME, ADDRESS, CITY, REGION, POSTAL CODE, PHONE NUM, EMAIL, CAT NAME AND USER ID.


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
    userId: mongoose.Schema.Types.ObjectId,
    adoptDate: Date
});

const Adopted = mongoose.model('Adopted', adoptedSchema);

module.exports = Adopted;