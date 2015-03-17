/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

var API_TOKEN = 'null';
var client_id = 'REPLACE THIS WITH YOUR DEVELOPER REDIRECT URL CLIENT_ID';
// Set a configurable with just the close callback
var Settings = require('settings');
Settings.config(
  { url: 'https://oauth.groupme.com/oauth/authorize?client_id=' + client_id },
  function(e) {
    console.log('closed configurable');
    
    console.log(String(JSON.stringify(e.options).substring(18,50)));
    
    Settings.data('ID', String(JSON.stringify(e.options).substring(18,50)));
    console.log(API_TOKEN);
  }
);
API_TOKEN = Settings.data('ID');

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Downloading GroupMe data...',
  font:'GOTHIC_12_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

var parseFeed = function(data){
  var groups = [];
  console.log('raw data: ' + data.contents);
   
  for(var i = 0; i < data.response.length; i++) {
  var title = data.response[i].name;
  var group_id = data.response[i].group_id;
    groups.push({
      title:title,
      group_id:group_id,
    });
  }
  return groups;
};
var parseMessages = function(data){
  var messages = [];
  console.log('raw data: ' + data.contents);
   
  for(var i = 0; i < data.response.messages.length; i++) {
  var title = data.response.messages[i].name;
  var text = data.response.messages[i].text;
    messages.push({
      title:title,
      subtitle:text,
    });
  }
  return messages;
};
var ajax = require('ajax');
ajax(
  {
    url: 'https://api.groupme.com/v3/groups?token=' + API_TOKEN,
    type: 'json'
  },
  function(data, status, request) {
    
    var menuItems = parseFeed(data);
    
    // Construct Menu to show to user
    var groupMenu = new UI.Menu({
      sections: [{
        title: 'Groups',
        items: menuItems
      }]
    });

    // Show the Menu, hide the splash
    groupMenu.show();
    splashWindow.hide();
    
    groupMenu.on('select', function(e) {
      var ajax2 = require('ajax');
      console.log('user slelected: ' + e.item.group_id);
      ajax2(
        {
          url: 'https://api.groupme.com/v3/groups/' + e.item.group_id + '/messages?token=' + API_TOKEN,
          type: 'json'
        },
        function(data, status, request){
          console.log('The second ajax request');
          var messages = parseMessages(data);
          console.log('user selected: ' + e.item.title);
          for(var i = 0; i < messages.length; i++) {
            console.log(messages[i].title + ' | ' + messages[i].subtitle);
          }
          
          var chat = new UI.Menu({
            sections: [{
              title: e.item.title,
              items: messages,
            }]
          });
          chat.show();
          
          chat.on('select', function(e){
            new UI.Card({
              title: e.item.title,
              body: e.item.subtitle,
              scrollable: true,
            }).show();  
          });
        },
        function(error, status, request) {
          console.log('The second ajax request failed: ' + error);
        }
      );
    });
    
  },
  function(error, status, request) {
    console.log('The ajax request failed: ' + error);
  }
);