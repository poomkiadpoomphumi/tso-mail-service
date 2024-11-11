const { SendMailService } = require('../Mail/send.js');
const MailService = async (req, res) => {
    try {
        const response = await SendMailService(req.body);
        if (response) {
            res.status(200).send(response);
        }else{
            res.status(204).send(response);
        }
    } catch (e) {
        console.log('Mail Service Error Function.', e);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { MailService }