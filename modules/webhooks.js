const express = require('express');
const router = express.Router();

// We need to execute some bash scripts on webhook execution
const execSync = require('child_process').execSync;

const home_directory = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
var self_hook = "do-not-use"
var bot_hook = "also-no-use"
var scripts_hook = "third-no-use"

if (require('os').hostname() == "illinifurs.com") {
    // Keep the actual webhooks we use secret
    const secrets = require(home_directory + '/secrets/secret.json');
    self_hook = secrets["git-path-self"];
    bot_hook = secrets["git-path-bot"];
    scripts_hook = secrets["git-path-scripts"];
}

router.post(`/${self_hook}`, function (req, res) {
    res.sendStatus(200);
    execSync('bash ' + home_directory + '/site/source/post_deploy.sh'); 
});

router.post(`/${bot_hook}`, function (req, res) {
    res.sendStatus(200); 
    execSync('bash ' + home_directory + '/bot/post_deploy.sh');
});

router.post(`/${scripts_hook}`, function (req, res) {
    res.sendStatus(200); 
    execSync('bash ' + home_directory + '/scripts/post_deploy.sh');
});

module.exports = {
    router: router
};
