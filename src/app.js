/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');


var menu = new UI.Menu({
  sections: [{
    title: 'Groups',
    items: [{
      title: 'Announcements',
    }, {
      title: 'Brotherhood'
    }]
  }]
});
menu.show();

menu.on('select', function(e) {
  var chat = new UI.Menu({
    sections: [{
      title: e.item.title,
      items: [{
        title: 'John Sampson',
        subtitle: 'foo bar',
      }, {
        title: 'Clay Langley',
        subtitle: 'bar foo',
      }]
    }]
  });
  
  chat.on('select', function(e){
    new UI.Card({
      title: e.item.title,
      body: e.item.subtitle,
      scrollable: true,
    }).show();
    
  });
  
  chat.show();
});
