// Main thing
const express = require('express');
const app = express();

// Check whether we are in the prod environment or not
if (require('os').hostname() == "illinifurs.com") {
    // Secrets needed for mysql login, etc.
    const secrets = require((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/secrets/secret.json');
    const icons_dir = require((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/icons/');
    const mysql_pw = secrets["website-mysql-pw"];

    // One unified login for MySQL stuff
    app.locals.mysql_options = {
        host: 'localhost',
        user: 'illapp',
        password: mysql_pw,
        database: 'website'
    };

    app.locals.icon_options = {
        root: icons_dir,
        dotfiles: 'deny'
    }
} else {
    app.locals.icon_options = {
        root: __dirname + '/public/icons/',
        dotfiles: 'deny'
    }
}

const page_info = require(__dirname + '/misc/pages.json');
file_not_found_entry = null;
for (row in page_info) {
    if (page_info[row]["pageid"] == "404") {
        file_not_found_entry = page_info[row];
        break;
    }
}

// How pages render
app.set('view engine', 'ejs');
// Trust that nginx did https if it says it did (but no further proxies)
app.set('trust proxy', 1);

// Every request should handle this part identically, no dotfiles, etc.
app.locals.site_options = {
    root: __dirname + '/public/',
    dotfiles: 'deny'
};

// Deal with information sent in POST requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve the engine pages
var engine = require('./modules/engine.js');
app.use(engine.router);

// Retrieving specific files (images, css, etc.)
var file_serve = require('./modules/file_serve.js');
app.use(file_serve.router);

// Webhooks stuff
var webhooks = require('./modules/webhooks.js');
app.use(webhooks.router);

// If we've got this far, it doesn't exist
app.use(function (req, res) {
    res.status(404);
    engine.render({ res: res, page: file_not_found_entry });
});

// Handle errors (but keep in mind, some may just be 404s from sendFile calls)
app.use(function (err, req, res, next) {
    var status = err.status || err.statusCode;
    if (status === 404) {
        res.status(404);
        engine.render({ res: res, page: file_not_found_entry });
    } else {
        if (res.headersSent) {
            return next(err);
        }

        res.status(500);
        var error_stack = err.stack.toString().replace(/ at/g, '<br>&nbsp;&nbsp;at');
        res.render('pages/error', { error: error_stack });
    }
});

var current_time = new Date().toISOString();

app.listen(3000, () => console.log('IlliniFurs site is now listening on port 3000. It went up at ' + current_time + '.'));
