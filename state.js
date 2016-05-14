var StateMachine = require('javascript-state-machine');
var distance = require('google-distance'); //should do dependency injection here

//TODO: multiuser state - seprate state for each user

var State = function(sender) { 
  //this.sender = sender;
  this.fsm = StateMachine.create({
    initial: 'init',
    events: [
      { name: 'hello',    from: 'init',               to: 'wait_for_postback' },
      { name: 'help',     from: 'wait_for_postback',  to: 'helping'    },
      { name: 'sendHelp', from: 'helping',            to: 'init' },
      { name: 'ask',      from: 'wait_for_postback',  to: 'asking' },
      { name: 'barrier',  from: 'wait_for_postback',  to: 'adding_barrier'  },
      { name: 'back',     from: ['helping', 'asking','adding_barrier','wait_for_postback' ], to: 'init'}
    ],
    callbacks: {
      onhello:    function(event, from, to, recipientId, msg) { sender.sendTemplate(recipientId, msg); },
      onhelp:     function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'Potrzebujesz pomocy. Podaj swoją lokalizację.'); },
      onask:      function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'O co chcesz zapytać?'); },
      onbarrier:  function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'Chcesz zgłosić barierę. Opisz barierę.'); },
      onback:     function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'Dzięki za współpracę. Jeżeli będziesz jeszcze potrzebował pomocy to daj znać.'); },
      onsendHelp: function(event, from, to, recipientId, location) {                                
                                              distance.get(
                                              {
                                                index: 1,
                                                origin: '50.061871, 19.939624',
                                                mode: 'walking',
                                                destination: location
                                              },
                                              function(err, data) {
                                                if (err) return console.log(err);
                                                sender.sendMessage(recipientId, "Wolontariusz jest od Ciebie oddalony o " + data.distance + ". Dotrze do Ciebie za " + data.duration);
                                              });
       },
    }
  });
};

exports.State = State;