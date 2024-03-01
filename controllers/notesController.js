const Note = require('../models/Note');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc Get all notes
// @route GET/notes
// @access Private
const getAllNotes = asyncHandler(async(req, res)=>{
    //Get all notes from MongoDB
    const notes = await Note.find().lean();

    //If no notes
    if(!notes?.length){
        return res.status(400).json({message: 'No notes found'});
    }
    // Add username for each note before sending the response
    const notesWithUser = await Promise.all(notes.map(async(note)=>{
        const user = await User.findById(note.user).lean().exec();
        return {...note, username: user.username}
    }));
    res.json(notesWithUser);
})

// @desc Create new not
// @route POST/notes
// @access Private
const createNewNote = asyncHandler(async(req,res)=>{
    const {user, title, text} = req.body;
    // confirm data
    if(!user || !title ||!text){
        return res.status(400).json({message: 'All fields are required'});
    }
    // check for duplicate title
    const duplicate = await Note.findOne({title}).lean().exec();
    if(duplicate){
        return res.status(409).json({message: 'Duplicate note title'});
    }
    // create and store new note
    const note = await Note.create({user, title, text});
    if(note){
        return res.status(201).json({message: 'New note created'});
    } else {
        return res.status(400).json({message: 'Invalid note data received'});
    }
});

// @desc Update a note
// @route PATCH/notes
// @access Private
const updateNote = asyncHandler(async(req, res)=>{
    const {id, user, title, text, completed} = req.body;

    // confirm data
    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        return res.status(400).json({message: 'All fields are required'});
    }

    // confirm note exists to update
    const note = await Note.findById(id).exec();

    if(!note){
        return res.status(400).json({message: 'Not not found'});
    }

    // check for duplicate title
    const duplicate = await Note.find({title}).lean().exec();

    // allow renaming of the original note
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate not title'});
    }
    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;
    const updatedNote = await note.save();
    res.json(`${updateNote.title} updated`);
});

// @desc Delete a note
// @route DELETE/notes
// @access Private
const deleteNote = asyncHandler(async(req, res)=>{
   const {id} = req.body;
   // confirm data
   if(!id){
    return res.status(400).json({message: 'Note ID required'});
   }
   // confirm note exists to delete
   const note = await Note.findById(id).exec();
   if(!note){
      return res.status(400).json({message: 'Note not found'});
    }
    const {title, _id} = note;
    await note.deleteOne();
    const reply = `Note ${title} with ID ${_id} deleted`;
    res.json(reply);
})


module.exports = {getAllNotes, createNewNote, updateNote, deleteNote}