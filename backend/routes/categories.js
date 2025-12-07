const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { auth , admin } = require ("../middleware/auth")

router.route('/')
    .get(getCategories)
    .post(auth, createCategory);

module.exports = router;