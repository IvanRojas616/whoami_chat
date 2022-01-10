//it points to ws server
//const socket = io("http://localhost:3000");
const socket = io();

socket.on('server:newuser', () => {
    alert("new connection");
});

const notifyMessage = (msg) => {
    socket.emit('client:newmsg',msg);
    console.log("Sending message to ws ...");
};

socket.on('server:loadmsgs',  msgs => {
    const data =  msgs.data;
    console.log("Loading messages...");
    const chatScreen = document.querySelector("#chat-screen")
    chatScreen.innerHTML = "";
    
    for (let [key, value] of Object.entries(data)) {
        chatScreen.innerHTML += `
        <li
        class="font-monospace text-break text-wrap shadow-sm p-1 mb-1     bg-secondary p-2 text-dark bg-opacity-25 rounded d-flex flex-column"
      >
      ${value}
      <p class="text-end fs-6 fw-bold">${new Date().toISOString()}</p>
      </li>
        `;
    }
});