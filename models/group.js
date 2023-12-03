

const { Schema, model } = require('mongoose');


const GroupSchema = Schema({
    name: {
        type: String,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    publications: [
        {
            type: Schema.Types.ObjectId ,
            ref: 'Publication'
        }
    ],
    type: {
        type: String,
        required: [true, 'The type required']
    }
});


GroupSchema.methods.toJSON = function() {
    const { __v, ...group  } = this.toObject();
    return group;
}



module.exports = model('Group', GroupSchema);