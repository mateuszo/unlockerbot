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
            echo(senderId, text);
        }
    }
    
    res.sendStatus(200);
});

app.listen(app.get('port'), function () {
    console.log('Magic starts on port', app.get('port'));
});


function echo(sender, text){
	var messageData = {
		text: '[echo] ' + text
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
