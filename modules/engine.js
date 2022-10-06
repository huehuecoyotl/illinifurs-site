const express = require('express');
const router = express.Router();

const page_info = require(__dirname + '/../misc/pages.json');

const sqlite3 = require('sqlite3');
const mysql = require('mysql');
const _ = require('lodash');

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
    INSERT OR REPLACE INTO fotorama (url, type, caption)
        VALUES ('https://coyo.tl/images/gallery/pieces/piece0.png', 'image', NULL),
               ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'Rick'),
               ('https://coyo.tl/images/gallery/refs/ref0.png', 'image', 'caption');
    INSERT OR REPLACE INTO officers (id, username, displayName, title, imageURL, chatInviter)
        VALUES (154194108, 'stanthreetimes', 'Stanford Stills', 'site-admin', 'https://coyo.tl/images/profile.png', 1);
    `);
}

function renderEnginePage(passthroughs, next) {
    res = passthroughs['res'];
    delete passthroughs['res'];

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
            passthroughs['officers'] = rows.filter((officer) => officer['chatInviter'] == 1);
            next(passthroughs);
        });
    } else {
        sql = mysql.format(sql, inputs);

        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query(sql, (err, rows, fields) => {
            passthroughs['officers'] = rows.filter((officer) => officer['chatInviter'] == 1);
            next(passthroughs);
        });
    }
}

function flowRight(fn_stack) {
    if (fn_stack.length == 0)
        return null;

    next = fn_stack.pop();

    return (arg) => next(arg, flowRight(fn_stack));
}

// Use sqlite for dev purposes, but mariadb for prod
var devFlag = false;
if (require('os').hostname() != "illinifurs.com")
    devFlag = true;

db = null;
if (devFlag) {
    db = new sqlite3.Database(__dirname + '/../misc/test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err && err.code != "SQLITE_CANTOPEN") {
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
    var entry = null;

    for (row in page_info) {
        if (page_info[row]["pageid"] == "index") {
            entry = page_info[row];
            break;
        }
    }

    if (entry) {
        fn_stack = [renderEnginePage];

        if (entry['fotorama']) {    
            fn_stack.push(_.curry(getFotoramaImages)(devFlag, dbInfo));
        }

        flowRight(fn_stack)({res: res, page: entry});
    }
});

router.get('/:file', function (req, res, next) {
    var file = req.params.file;
    var dbInfo = devFlag ? db : req.app.locals.mysql_options;
    var entry = null;

    if (file != "index") {
        for (row in page_info) {
            if (page_info[row]["pageid"] == file) {
                entry = page_info[row];
                break;
            }
        }

        if (entry) {
            fn_stack = [renderEnginePage];

            if (entry['fotorama']) {    
                fn_stack.push(_.curry(getFotoramaImages)(devFlag, dbInfo));
            }

            if (file == "chat") {
                fn_stack.push(_.curry(getOfficers)(devFlag, dbInfo));
            }

            flowRight(fn_stack)({res: res, page: entry});
        }
    }

    if (!entry) {
        next();
    }
});

module.exports = {
    router: router
};
