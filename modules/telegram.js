const express = require('express');
const router = express.Router();

const TelegramBot = require('node-telegram-bot-api');

// Keep the Telegram token secret
const home_directory = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
const secrets = require(home_directory + '/secrets/secret.json');
const token = secrets["telegram-token"];

const bot = new TelegramBot(token);

bot.setWebHook(`https://illinifurs.com/bot${token}`);

router.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, `Received your message, chat ID: ${chatId}`);
});

module.exports = {
    router: router
};
