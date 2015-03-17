/** Welcome to John Sampson's GroupMe app for the Pebble Smart Watch */

var UI = require('ui');
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

// these are the variables for the tokens. 
// client_id comes from an API application from https://dev.groupme.com/applications
// Make sure that, when you make an API application, you use the callback url 'pebblejs://close#'
// the API_TOKEN is returned when the user goes to the config page and enters their account stuff
var API_TOKEN = 'null';
var client_id = 'REPLACE THIS WITH YOUR DEVELOPER REDIRECT URL CLIENT_ID';


// this configures the API_TOKEN
// When the user presses the config button in the Pebble iPhone/Android app, it goes to GroupMe's oauth page
// if you configured it correctly, it sends a callback like 'pebblejs://close#?access_token=ACCESS_TOKEN'
// I just used substring to get out the actual key. I'm sure you can do it better.
// It then uses Pebble's Settings library to save it in the App for later use. 
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

// Splash screen while loading. 
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

// this function parses the groups that the user is a part of, and returns them
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

// this parses the messages for the group the user selected, and returns them
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

// this is the ajax stuff
// the main ajax block requests the GroupMe groups for the user, then shows them
// when the user hits the select button, it launches another ajax block which:
// requests the messages from the API for that group and displays them.
// when the user hits the select button, it opens a new card with the full name and message. 
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