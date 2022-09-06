const express = require('express');
const router = express.Router();

router.get('/images/*', function (req, res) {
    var file = req.params[0];
    res.sendFile('images/' + file, req.app.locals.site_options);  
});

router.get('/css/:file', function (req, res) {
    var file = req.params.file;
    res.sendFile('css/' + file, req.app.locals.site_options);
});

router.get('/js/:file', function (req, res) {
    var file = req.params.file;
    res.sendFile('js/' + file, req.app.locals.site_options); 
});

router.get('/*.txt', function (req, res) {
    var file = req.params[0] + ".txt";
    res.sendFile('txt/' + file, req.app.locals.site_options);
});

module.exports = {
    router: router
};
