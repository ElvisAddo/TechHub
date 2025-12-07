const express = require('express');
const router = express.Router();
const {
    getAllQuestions,
    getQuestionsByCategory,
    createQuestion,
    getQuestionById,
    deleteQuestion,
} = require('../controllers/questionController');
const { auth } = require('../middleware/auth');
const { updateAnswer } = require('../controllers/answerController');

router.route('/').get(getAllQuestions).post(auth, createQuestion);
router.route('/category/:categoryId').get(getQuestionsByCategory);
router.route('/:id').get(getQuestionById).put(auth, updateAnswer).delete(deleteQuestion);

module.exports = router;