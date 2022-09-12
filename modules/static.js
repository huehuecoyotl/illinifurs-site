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

// Single sites

router.get('/', function (req, res) {
    res.render('pages/engine', { page: index_entry });
});

module.exports = {
    router: router
};
