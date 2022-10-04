const express = require('express');
const router = express.Router();

// We need to execute some bash scripts on webhook execution
const execSync = require('child_process').execSync;

const home_directory = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
var self_hook = "do-not-use"

if (require('os').hostname() == "illinifurs.com") {
    // Keep the actual webhooks we use secret
    const secrets = require(home_directory + '/secrets/secret.json');
    self_hook = secrets["git-path-self"];
    bot_hook = secrets["git-path-bot"];
}

router.post(`/${self_hook}`, function (req, res) {
    execSync('bash ' + home_directory + '/site/source/post_deploy.sh');
    // Weirdly, this isn't actually supposed to send a status back --
    // Node should restart the site, resulting in a 503 from nginx
    res.sendStatus(500); 
});

router.post(`/${bot_hook}`, function (req, res) {
    execSync('bash ' + home_directory + '/bot/post_deploy.sh');
    res.sendStatus(200); 
});

module.exports = {
    router: router
};
