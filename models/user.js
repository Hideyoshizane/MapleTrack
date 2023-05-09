const Joi = require('joi');
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({

    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
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
        maxlength: 20
    }
})); 

function validateUser(user) {
    const schema = Joi.object({
        username: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(7).max(25).required(),
        password: Joi.string().min(8).max(20).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;