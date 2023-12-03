

const { Schema, model } = require('mongoose');


const PublicationSchema = Schema({
    title: {
        type: String,
        required: [true, 'The title of the post is required']
    },
    description: {
        type: String,
        required: [true, 'The description of the post is required']
    },
    code: {
        type: String,
        default: ''
    },
    file: {
        type: String,
        default: ''
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The author is requires'],
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'The group is requires'],
    },
    comments: {
        type: Array,
    },
    likesUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ]

},{
    timestamps: true
});


PublicationSchema.methods.toJSON = function() {
    const { __v, ...publication  } = this.toObject();
    return publication;
}


module.exports = model('Publication', PublicationSchema);