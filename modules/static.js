const express = require('express');
const router = express.Router();

// Single sites

router.get('/', function (req, res) {
    res.render('pages/index');
});

module.exports = {
    router: router
};
