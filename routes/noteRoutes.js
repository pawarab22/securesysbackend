const express = require('express');
const router = express.Router();
const { getNotes, setNote, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { ensureIdempotency } = require('../middlewares/idempotencyMiddleware');
const { body, param } = require('express-validator');

// Validation rules
const noteValidation = [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('content').optional().isString().withMessage('Content must be a string')
];

const updateNoteValidation = [
    body('title').optional().not().isEmpty().withMessage('Title cannot be empty if provided'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('version').optional().isInt({ min: 0 }).withMessage('Version must be a non-negative integer')
];

const noteIdValidation = [
    param('id').isUUID().withMessage('Invalid note id')
];

router.route('/')
    .get(protect, getNotes)
    .post(protect, ensureIdempotency, validate(noteValidation), setNote);

router.route('/:id')
    .put(protect, validate([...noteIdValidation, ...updateNoteValidation]), updateNote)
    .delete(protect, validate(noteIdValidation), deleteNote);

module.exports = router;
