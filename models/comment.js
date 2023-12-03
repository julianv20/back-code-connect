

const { Schema, model } = require('mongoose');

const CommentSchema = Schema({
    text: {
        type: String,
        required: [true, 'The text of the comment is required']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo de usuario para el autor del comentario.
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment', // Referencia al mismo modelo de comentario para representar comentarios anidados.
    },
    publication: {
        type: Schema.Types.ObjectId,
        ref: 'Publication' // Agrega una referencia a la publicación a la que pertenece el comentario.
    },
    replys: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment', // Referencia al mismo modelo de comentario para representar comentarios anidados.
        },
    ]   
},{
    timestamps: true
});

CommentSchema.methods.toJSON = function() {
    const { __v, ...comment } = this.toObject();
    return comment;
};

module.exports = model('Comment', CommentSchema);
