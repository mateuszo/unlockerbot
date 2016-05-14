var StateMachine = require('javascript-state-machine');

//TODO: multiuser state - seprate state for each user

var State = function(sender) { 
  //this.sender = sender;
  this.fsm = StateMachine.create({
    initial: 'init',
    events: [
      { name: 'hello',    from: 'init',               to: 'wait_for_postback' },
      { name: 'help',     from: 'wait_for_postback',  to: 'helping'    },
      { name: 'ask',      from: 'wait_for_postback',  to: 'asking' },
      { name: 'barrier',  from: 'wait_for_postback',  to: 'adding_barrier'  },
      { name: 'back',     from: ['helping', 'asking','adding_barrier','wait_for_postback' ], to: 'wait_for_postback'}
    ],
    callbacks: {
      onhello:    function(event, from, to, recipientId, msg) { sender.sendTemplate(recipientId, msg); },
      onhelp:     function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'Potrzebujesz pomocy. Podaj swoją lokalizację.'); },
      onask:      function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'O co chcesz zapytać?'); },
      onbarrier:  function(event, from, to, recipientId, msg) { sender.sendMessage(recipientId, 'Chcesz zgłosić barierę. Opisz barierę.'); },
      onback:     function(event, from, to, recipientId, msg) { sender.sendTemplate(recipientId, msg); },
    }
  });
};

exports.State = State;