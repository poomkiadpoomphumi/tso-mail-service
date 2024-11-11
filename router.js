const express = require('express');
const router = express.Router();
const { MailService } = require('./controller/Mail.js');

router.post('/mail/MailService', MailService);

module.exports = router;