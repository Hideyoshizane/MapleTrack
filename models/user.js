const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const bcrypt = require('bcrypt');

const LASTVERSION = 0;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        unique: true
    },
    email: {
        type: String,
        required: true,
        minlength: 7,
        maxlength: 256,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 61
    },
    version: {
        type: Number,
    },
    date: {type: Date},
    servers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server'
    }]
}, { strictPopulate: false });


const User = mongoose.model('User', userSchema);

async function updateLastLogin(userID){
    const userData = await User.findById(userID);
    const luxonDate = DateTime.utc();
    userData.date = luxonDate.toJSDate();
    await userData.save();
}


async function updateUserVersion(userID){
    const userData = await User.findById(userID);
    userData.version = LASTVERSION;
    await userData.save();
}

async function resetPasswordEmptyUser(username){
    const userData = await User.findOne({username});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    userData.password = hashedPassword;
    await userData.save();
}

module.exports = {
    User,   
    updateLastLogin,
    LASTVERSION,
    updateUserVersion,
    resetPasswordEmptyUser
};