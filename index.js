const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');

//Models
const Note = require('./models/notes');


//Middleware
app.use(express.json())

//Connecting Database
mongoose
    .connect('mongodb+srv://node-api:nodeapi@cluster0.hp8ha.mongodb.net/Node-API?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Database Connected Successfully"))
.catch(err => console.log(err));

//Home Route
app.get('/', (req, res) => {
    res.send('Welcome to notes App')
})

//Get all notes
app.get('/notes', async(req, res) => {
    try{
        const notes = await Note.find();
        res.send(notes);s
    }catch(err){
        res.status(500).send(err);
    }
})

//Get single note
app.get('/notes/:noteId', 
[check('noteId', 'This note is not found').isMongoId()],
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
       return res.status(404).send(errors.array());
    }
    try{
        const id = req.params.noteId;
        const note = await Note.findById(id);
        if(!note) return res.status(404).send('Not not found');
        res.send(note);
    }catch(err){
        res.status(500).send(err)
    }
})

//Adding Notes
app.post('/notes', 

[
    check('title')
    .notEmpty()
    .withMessage('Title is Required'),

    check('description')
    .notEmpty()
    .withMessage('Description is Required')
],

async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({error: errors.array()});
    }
    const note = new Note(req.body);
    try{
        await note.save();
        res.send(note);
    }catch(err){
        res.status(400).send(err)
    }
})

//Update Note
app.put('/notes/:noteId', 

[
    check('noteId', 'Note not found').isMongoId(),
    check('title', 'Title not found').optional().notEmpty(),
    check('description', 'description not found').optional().notEmpty()
],

async (req, res) => {
    const id = req.params.noteId;
    const gotNoteInput = Object.keys(req.body)
    const allowedUpdate = ['title', 'description']
    const isAllowed = gotNoteInput.every(update => allowedUpdate.includes(update));
    if(!isAllowed) return res.status(400).send('Invalid Updates')
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send(errors.array())
    }
    try{
        const note = await Note.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if(!note) return res.status(404).send('No note found');
        res.send(note);
    }catch(err){
        res.status(500).send(err)
    }
})

//Delete Note
app.delete('/notes/:noteId', 
    check('noteId', 'Not not found').isMongoId(),
    async (req, res) => {
    const id = req.params.noteId;
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(404).send('Not found')
    try{
        const note = await Note.findByIdAndDelete(id);
        if(!note) return res.status(404).send('Note not found');
        res.send(note);
    }catch(err){
        res.status(500).send(err)
    }
    
})

//Not Found
app.get('*', (req, res) => {
    res.status(404).send('404 Not Found')
})

//Creating Server
app.listen(3000, () => {
    console.log('Server is created and listening on port 3000')
})