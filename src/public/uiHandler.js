const formChat = document.querySelector('#formchat');
const inputChat = document.querySelector('#message');

formChat.addEventListener('submit', e => {
    e.preventDefault();
    notifyMessage(inputChat.value);
});