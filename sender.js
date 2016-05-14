var request = require('request');

var Sender = function (access_token) {
	this.access_token = access_token;
	
	this.sendMessage = function (recipientId, text){
		var messageData = {
			text: text
		};
	    request({
	        method: 'POST',
	        url: 'https://graph.facebook.com/v2.6/me/messages',
	        qs: {access_token: this.access_token},
	        json: {
	            recipient: {id: recipientId},
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
	
	this.sendTemplate = function (recipientId, text){
	    var messageData = {
	        "attachment":{
	          "type":"template",
	          "payload":{
	            "template_type":"button",
	            "text":"Witaj!\nW czym mogę Ci pomóc?",
	            "buttons":[
	              {
	                "type":"postback",
	                "title":"Chcę zgłosić barierę",
					"payload":"barrier"
	              },
	              {
	                "type":"postback",
	                "title":"Potrzebuję pomocy",
	                "payload":"help"
	              },
				  {
	                "type":"postback",
	                "title":"Mam pytanie",
	                "payload":"ask"
	              }
	            ]
	          }
	        }
	    };
	    request({
	        method: 'POST',
	        url: 'https://graph.facebook.com/v2.6/me/messages',
	        qs: {access_token: this.access_token},
	        json: {
	            recipient: {id: recipientId},
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
}

exports.Sender = Sender;