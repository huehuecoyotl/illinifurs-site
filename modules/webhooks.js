const express = require('express');
const router = express.Router();

// We need to execute some bash scripts on webhook execution
const execSync = require('child_process').execSync;

// Keep the actual webhooks we use themselves secret
const home_directory = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
const secrets = require(home_directory + '/secrets/secret.json');
const self_hook = secrets["git-path-self"];

router.post(`/${self_hook}`, function (req, res) {
    execSync('bash ' + home_directory + '/site/source/post_deploy.sh');
    // Weirdly, this isn't actually supposed to send a status back --
    // Node should restart the site, resulting in a 503 from nginx
    res.sendStatus(500); 
});

module.exports = {
    router: router
};
