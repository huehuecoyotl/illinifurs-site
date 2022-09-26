const express = require('express');
const router = express.Router();

const page_info = require(__dirname + '/../misc/pages.json');
index_entry = null;
for (row in page_info) {
    if (page_info[row]["pageid"] == "index") {
        index_entry = page_info[row];
        break;
    }
}

// Engine sites

router.get('/', function (req, res) {
    res.render('pages/engine', { page: index_entry });
});

router.get('/:file', function (req, res, next) {
    var file = req.params.file;
    var entry = null;

    if (file != "index") {
        for (row in page_info) {
            if (page_info[row]["pageid"] == file) {
                entry = page_info[row];
                break;
            }
        }

        if (entry) {
            res.render('pages/engine', { page: entry });
        }
    }

    if (!entry) {
        next();
    }
});

module.exports = {
    router: router
};
