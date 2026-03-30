const express = require('express');
const router = express.Router();
const { getNotes, setNote, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { ensureIdempotency } = require('../middlewares/idempotencyMiddleware');
const { body } = require('express-validator');

// Validation rules
const noteValidation = [
    body('title').not().isEmpty().withMessage('Title is required')
];

router.route('/')
    .get(protect, getNotes)
    .post(protect, ensureIdempotency, validate(noteValidation), setNote);

router.route('/:id')
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;
