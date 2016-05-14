var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var secret = require('./secret.js');

app.use(bodyParser.json()); // I've got a susspicion that it causes the webhook verification error

app.set('port', (process.env.PORT || 5000));

app.use(function (req, res, next) {
    console.log('received :' + req.method + ' request');
    next();
})

app.get('/', function (req, res) {
    res.send("Hello world");
})

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === secret.verify_token) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook', function (req, res) {
    var messagingEvents = req.body.entry[0].messaging;
    for(var i = 0; i < messagingEvents.length; i++ ) {
        var event = messagingEvents[i];
        var senderId = event.sender.id;
        //if the message is not empty
        if(event.message && event.message.text){
            var text = event.message.text;
            console.log('Received: ' + text + ' from: ' + senderId);
            messageRouter(senderId, text);
        }
    }
    
    res.sendStatus(200);
});

app.listen(app.get('port'), function () {
    console.log('Magic starts on port', app.get('port'));
});

function messageRouter(senderId, text){
    var msg = '';
    if(text.indexOf("info") > 0){
        //informacje o bocie
        msg = "Witaj! \n Jestem tutaj żeby Ci pomóc. Wpisz: 'Chciałbym zgłosić barierę', 'Potrzebuję pomocy', 'Mam pytanie' lub cokolwiek innego.";
    } else if(text.indexOf("barier") > 0){
        //prośba zgłoszenia bariery
        msg = "Chcesz zgłosić barierę. Wyślij opis, lokalizację oraz zdjęcia bariery.";
    } else if(text.indexOf("pomocy") > 0){
        //użytkownik potrzebuje pomocy
        msg = "Potrzebujesz pomocy. Szukam wolontariusza w Twojej okolicy.";
    } else if(text.indexOf("pytanie") > 0){
        //użytkownik ma pytanie
        msg = "Masz pytanie. Podaj treść pytania oraz lokalizację, której ono dotyczy.";
    } else if(text.indexOf("template") > 0){
        sendTemplate(senderId, text);
    } else {
        msg = '[echo] ' + text;
    }
    sendMessage(senderId, msg);
}


function sendMessage(sender, text){
	var messageData = {
		text: text
	};
    request({
        method: 'POST',
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: secret.token},
        json: {
            recipient: {id: sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if(error){
            console.log('Error sending messages: ', error);
        } else if(response.body.error){
            console.log('Error: ', response.body.error);
        }
    });
};

function sendTemplate(sender, text){
    var messageData = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"What do you want to do next?",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com",
                "title":"Show Website"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"USER_DEFINED_PAYLOAD"
              }
            ]
          }
        }
    };
    request({
        method: 'POST',
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: secret.token},
        json: {
            recipient: {id: sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if(error){
            console.log('Error sending messages: ', error);
        } else if(response.body.error){
            console.log('Error: ', response.body.error);
        }
    });
}
