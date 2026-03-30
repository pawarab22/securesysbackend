const { Note } = require('../models');

// @desc    Get notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.findAll({
            where: { userId: req.user.id }
        });
        res.status(200).json(notes);
    } catch (error) {
        next(error);
    }
};

// @desc    Set note
// @route   POST /api/notes
// @access  Private
const setNote = async (req, res, next) => {
    const { title, content } = req.body;

    try {
        const note = await Note.create({
            title,
            content,
            userId: req.user.id
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
    try {
        const note = await Note.findByPk(req.params.id);

        if (!note) {
            res.status(404);
            throw new Error('Note not found');
        }

        // Check for user
        if (note.userId !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        // Check version for optimistic concurrency control (Optional if provided by client)
        const { title, content, version } = req.body;
        
        if (version && note.version !== parseInt(version, 10)) {
            res.status(409);
            throw new Error('Conflict: The entry was updated by another request.');
        }

        note.title = title || note.title;
        note.content = content !== undefined ? content : note.content;

        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findByPk(req.params.id);

        if (!note) {
            res.status(404);
            throw new Error('Note not found');
        }

        // Check for user
        if (note.userId !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await note.destroy();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotes,
    setNote,
    updateNote,
    deleteNote
};
