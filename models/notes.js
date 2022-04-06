const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: String
},{
    timestamps: true
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note;
