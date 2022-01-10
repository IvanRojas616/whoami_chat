"use strict";

var formChat = document.querySelector('#formchat');
var inputChat = document.querySelector('#message');
formChat.addEventListener('submit', function (e) {
  e.preventDefault();
  notifyMessage(inputChat.value);
});