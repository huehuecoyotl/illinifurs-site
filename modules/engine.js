const express = require('express');
const router = express.Router();

const page_info = require(__dirname + '/../misc/pages.json');

// DB connections
const sqlite3 = require('sqlite3');
const mysql = require('mysql');

// For function currying
const _ = require('lodash');

// Converts markdown input into HTML
const showdown    = require('showdown');
const converter   = new showdown.Converter({
                        simplifiedAutoLink: true,
                        excludeTrailingPunctuationFromURLs: true,
                        strikethrough: true,
                        simpleLineBreaks: true,
                        ellipsis: true
                    });

// Handles sanitization of input
const createDOMPurify = require('dompurify');
const { JSDOM }       = require('jsdom');
const window          = new JSDOM('').window;
const DOMPurify       = createDOMPurify(window);

function createDatabase() {
    var newdb = new sqlite3.Database(__dirname + '/../misc/test.db', (err) => {
        if (err) {
            console.log("SQLite error: " + err);
            exit(1);
        }
        createTables(newdb);
    });

    return newdb;
}

function createTables(newdb) {
    newdb.exec(`
    CREATE TABLE IF NOT EXISTS fotorama (
        url TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        caption TEXT
    );
    CREATE TABLE IF NOT EXISTS officers (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        displayName TEXT,
        title TEXT NOT NULL,
        imageURL TEXT NOT NULL,
        chatInviter INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        allDay INTEGER NOT NULL,
        description TEXT NOT NULL
    );
    INSERT OR REPLACE INTO fotorama (url, type, caption)
        VALUES ('https://coyo.tl/images/gallery/pieces/piece0.png', 'image', NULL),
               ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'Rick'),
               ('https://coyo.tl/images/gallery/refs/ref0.png', 'image', 'caption');
    INSERT OR REPLACE INTO officers (id, username, displayName, title, imageURL, chatInviter)
        VALUES (154194108, 'stanthreetimes', 'Stanford Stills', 'site-admin', 'https://coyo.tl/images/profile.png', 1);
    INSERT OR REPLACE INTO events (id, name, location, start, end, allDay, description)
        VALUES (1, 'Test', 'Urbana', '2022-10-15 17:00:00.000', '2022-10-16 19:00:00.000', 0, 'Test Event'),
               (2, 'Long Title Splits Over Many Lines', 'Champaign', '2022-10-22 17:00:00.000', '2022-10-22 19:00:00.000', 1, 'Other Event https://coyo.tl/');
    `);
}

function renderEnginePage(passthroughs, next) {
    res = passthroughs['res'];
    delete passthroughs['res'];

    if (!('fotorama_images' in passthroughs))
        passthroughs['fotorama_images'] = null;

    if (!('officers' in passthroughs))
        passthroughs['officers'] = null;

    if (!('events' in passthroughs))
        passthroughs['events'] = null;

    res.render('pages/engine', passthroughs);

    if (next)
        next();
}

function getFotoramaImages(devFlag, db, passthroughs, next) {
    var sql = "SELECT url, type, caption FROM fotorama";
    var inputs = [];

    if (devFlag) {
        db.all(sql, (err, rows) => {
            passthroughs['fotorama_images'] = rows;
            next(passthroughs);
        });
    } else {
        sql = mysql.format(sql, inputs);

        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query(sql, (err, rows, fields) => {
            passthroughs['fotorama_images'] = rows;
            next(passthroughs);
        });
    }
}

function getOfficers(devFlag, db, passthroughs, next) {
    var sql = "SELECT username, displayName, title, imageURL, chatInviter FROM officers";
    var inputs = [];

    if (devFlag) {
        db.all(sql, (err, rows) => {
            passthroughs['officers'] = rows.filter((officer) => officer['chatInviter'] === 1);
            next(passthroughs);
        });
    } else {
        sql = mysql.format(sql, inputs);

        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query(sql, (err, rows, fields) => {
            passthroughs['officers'] = rows.filter((officer) => officer['chatInviter'] === 1);
            next(passthroughs);
        });
    }
}

function getEvents(devFlag, db, passthroughs, next) {
    var sql = "SELECT name, location, start, end, allDay, description FROM events";
    var inputs = [];

    if (devFlag) {
        db.all(sql, (err, rows) => {
            rows.forEach((event) => {
                event['start'] = new Date(event['start']);
                event['end'] = new Date(event['end']);
                text = converter.makeHtml(event['description']);
                text = DOMPurify.sanitize(text, {USE_PROFILES: {html: true}});
                event['description'] = text;
            });
            passthroughs['events'] = rows.sort((a, b) => a['start'] - b['start']);
            next(passthroughs);
        });
    } else {
        sql = mysql.format(sql, inputs);

        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query(sql, (err, rows, fields) => {
            rows.forEach((event) => {
                event['start'] = new Date(event['start']);
                event['end'] = new Date(event['end']);
                text = converter.makeHtml(event['description']);
                text = DOMPurify.sanitize(text, {USE_PROFILES: {html: true}});
                event['description'] = text;
            });
            passthroughs['events'] = rows.sort((a, b) => a['start'] - b['start']);
            next(passthroughs);
        });
    }
}

function flowRight(fn_stack) {
    if (fn_stack.length === 0)
        return null;

    next = fn_stack.pop();

    return (arg) => next(arg, flowRight(fn_stack));
}

function useEngine(res, file, dbInfo) {
    var entry = null;

    for (row in page_info) {
        if (page_info[row]["pageid"] === file && page_info[row]["directory"] === "main") {
            entry = page_info[row];
            break;
        }
    }

    if (entry) {
        fn_stack = [renderEnginePage];

        if (entry['fotorama']) {    
            fn_stack.push(_.curry(getFotoramaImages)(devFlag, dbInfo));
        }

        if (file === "chat") {
            fn_stack.push(_.curry(getOfficers)(devFlag, dbInfo));
        }

        if (file === "events") {
            fn_stack.push(_.curry(getEvents)(devFlag, dbInfo));
        }

        flowRight(fn_stack)({res: res, page: entry});

        return true;
    } else {
        return false;
    }
}

// Use sqlite for dev purposes, but mariadb for prod
var devFlag = false;
if (require('os').hostname() !== "illinifurs.com")
    devFlag = true;

db = null;
if (devFlag) {
    db = new sqlite3.Database(__dirname + '/../misc/test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err && err.code !== "SQLITE_CANTOPEN") {
            console.log("Getting error " + err);
            exit(1);
        } else if (!err) {
            db = createDatabase();
        }
    });
} 

// Engine sites

router.get('/', function (req, res) {
    var dbInfo = devFlag ? db : req.app.locals.mysql_options;

    useEngine(res, "index", dbInfo);
});

router.get('/:file', function (req, res, next) {
    var file = req.params.file;
    var dbInfo = devFlag ? db : req.app.locals.mysql_options;

    var fileFound = false;
    if (file !== "index") {
        fileFound = useEngine(res, file, dbInfo);
    }

    if (!fileFound) {
        next();
    }
});

module.exports = {
    router: router
};
