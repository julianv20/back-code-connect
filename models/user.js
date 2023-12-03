const { Schema, model } = require('mongoose');


const UserSchema = Schema({

    name: {
        type: String,
        required: [true, 'The name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'The last name is required'],
    },
    country: {
        type: String,
        required: [true, 'The country is required'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'The phone number is required'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'The email is required'],
        unique: true,
    },  
    password: {
        type: String,
        required: [true, 'The password is required'],
    },
    imageProfile: {
        type: String,
        default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/800px-Default_pfp.svg.png'
    },
    imageBanner: {
        type: String,
        default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/640px-Image_not_available.png'
    },
    description: {
        type: String,
        default: "This user doesn't have description"
    },
    groups: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }
    ],
    publications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Publication'
        }
    ],
    likesPublications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Publication'
        }
    ],
    notifications:[
        {
            idPublication: {
                type: Schema.Types.ObjectId, // ID de la publicación relacionada
                ref: 'Publication',
            },
            name: String, // Nombre de la persona que publicó
            lastName: String, // Apellido de la persona que publicó
            message: String, // Mensaje de la notificación
        },
    ],
    github: {
        type: String,
        default: "",
    },
    online: {
        type: Boolean,
        default: false
    },
    state: {
        type: Boolean,
        default: true,
    },

});


UserSchema.methods.toJSON = function() {
    const { __v, password, ...user  } = this.toObject();
    return user;
}

//Se coloca en singular porque mongoose coloca la S automaticamente
module.exports = model( 'User', UserSchema );
