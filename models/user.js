const Joi = require('joi');
const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const passportLocalMongoose = require('passport-local-mongoose');

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
    date: {type: Date},
    weeklyBosses: {type: Number},
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

async function updateWeeklyBosses(userID){
    const userData = await User.findById(userID);
    const timeNow = DateTime.utc();
    const userLastLogin = DateTime.fromJSDate(userData.date);
    const nextWednesday = userLastLogin.plus({ days: 1 }).set({ weekday: 3, hour: 0, minute: 0, second: 0, millisecond: 0 });
   // Check if the last login date is before the most recent Wednesday midnight (UTC)
    if (timeNow >= nextWednesday) {
        userData.weeklyBosses = Number(0);
        await userData.save();
        console.log("Bosses updated.");
    }
    else{
        console.log("Bosses not needed update.");
    }
}


module.exports = {
    User,
    validate,
    updateLastLogin,
    updateWeeklyBosses
};