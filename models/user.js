const Joi = require('joi');
const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const passportLocalMongoose = require('passport-local-mongoose');

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
        maxlength: 25,
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

userSchema.plugin(passportLocalMongoose);



const User = mongoose.model('User', userSchema);

function validate(user) {
    const schema = Joi.object({
        username: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(7).max(25).required(),
        password: Joi.string().min(8).max(61).required(),
    });
    
    return schema.validate(user);
}

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

module.exports = {
    User,
    validate,
    updateLastLogin,
    LASTVERSION,
    updateUserVersion
};