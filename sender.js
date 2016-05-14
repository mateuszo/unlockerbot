var request = require('request');

var Sender = function (access_token) {
	this.access_token = access_token;
	
	this.sendMessage = function (sender, text){
		var messageData = {
			text: text
		};
	    request({
	        method: 'POST',
	        url: 'https://graph.facebook.com/v2.6/me/messages',
	        qs: {access_token: this.access_token},
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
	
	this.sendTemplate = function (sender, text){
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
	        qs: {access_token: this.access_token},
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
}

exports.Sender = Sender;