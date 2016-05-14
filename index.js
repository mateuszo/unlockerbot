var express = require('express');
var bodyParser = require('body-parser');
var secret = require('./secret.js');
var Sender = require('./sender.js').Sender;
var State = require('./state.js').State;

var sender = new Sender(secret.token);

var state = new State(sender);
console.log(state.fsm.current);


var app = express();
app.use(bodyParser.json()); // I've got a susspicion that it causes the webhook verification error

app.set('port', (process.env.PORT || 5000));

app.use(function (req, res, next) {
    console.log('received :' + req.method + ' request: ');
    console.log('request body', JSON.stringify(req.body));
    next();
});

app.get('/', function (req, res) {
    res.send("Hello world");
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === secret.verify_token) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook', function (req, res) {
    var messagingEvents = req.body.entry[0].messaging;
    messageEventController(messagingEvents);
    
    res.sendStatus(200);
});

app.listen(app.get('port'), function () {
    console.log('Magic starts on port', app.get('port'));
});

function messageEventController(messagingEvents){
   for(var i = 0; i < messagingEvents.length; i++ ) {
        var event = messagingEvents[i];
        var senderId = event.sender.id;
        stateController(event,senderId);        
    }
};

function stateController(event, senderId){
    console.log('current state:', state.fsm.current);
    var text = '';
    //if the message is not empty
    if(event.message && event.message.text){
        text = event.message.text;
        console.log('Text received: "' + text + '" from: ' + senderId);
        
        switch(state.fsm.current){
           case 'init':  state.fsm.hello(senderId, text); break;
           case 'helping': 
                console.log("Need help " + text); 
                state.fsm.back(senderId, text);
                break;
           case 'asking': 
                console.log("The question is: " + text); 
                state.fsm.back(senderId, text);
                break;
           case 'adding_barrier': 
                console.log("New barrier: " + text); 
                state.fsm.back(senderId, text);
                break;
           default: state.fsm.back(senderId, text);
        }
    }
    //if message is postback
    else if (event.postback) {
		text = JSON.stringify(event.postback);
        console.log('Postback received: ' + text + ' from: ' + senderId);
		if(state.fsm.current === "wait_for_postback"){
            switch(event.postback.payload){
                case 'barrier': state.fsm.barrier(senderId, text); break;
                case 'help': state.fsm.help(senderId, text) ; break;
                case 'ask': state.fsm.ask(senderId, text); break;
            }
        }
	}
};