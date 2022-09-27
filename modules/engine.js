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

const sqlite3 = require('sqlite3');
const mysql = require('mysql');

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
    INSERT OR REPLACE INTO fotorama (url, type, caption)
        VALUES ('https://coyo.tl/images/gallery/pieces/piece0.png', 'image', NULL),
               ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'Rick'),
               ('https://coyo.tl/images/gallery/refs/ref0.png', 'image', 'caption');
    `);
}

function getFotoramaImages(devFlag, db, next) {
    var sql = "SELECT url, type, caption FROM fotorama";
    var inputs = [];

    if (devFlag) {
        db.all(sql, (err, rows) => {
            next(rows);
        });
    } else {
        sql = mysql.format(sql, inputs);

        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query(sql, (err, rows, fields) => {
            next(rows);
        });
    }
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
    getFotoramaImages(devFlag, dbInfo, (fotorama_images) => {
        res.render('pages/engine', { page: index_entry, fotorama_images: fotorama_images });
    });
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
            if (entry['fotorama']) {
                getFotoramaImages(devFlag, dbInfo, (fotorama_images) => {
                    res.render('pages/engine', { page: entry, fotorama_images: fotorama_images });
                });
            } else {
                res.render('pages/engine', { page: entry, fotorama_images: [] });
            }
        }
    }

    if (!entry) {
        next();
    }
});

module.exports = {
    router: router
};
