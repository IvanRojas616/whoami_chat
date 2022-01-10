import * as admin from "firebase-admin";
import express from "express";
import { createServer } from "http";
import { Server as WebSocketServer } from "socket.io";

const dotenv = require("dotenv");
const app = express();
const httpServer = createServer(app);
const io = new WebSocketServer(httpServer);
const port = process.env.PORT || 3000;

//env variables
dotenv.config();

//serialize json credentials for google
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

//firebase variables
let db = null;
let refMessages = null;

//begin the connection with realtime database
try {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: process.env.DB_URI,
  });

  db = admin.database();
  refMessages = db.ref("/messages");
  console.log("DB connected");
} catch (error) {
  console.log("DB error " + error);
}

//serve the static files from public folder
app.use(express.static(__dirname + "/public"));

//in connection event on ws server, we config the behavior for every socket client that connects with it
io.on("connection", (socket) => {
  console.log("new connection: " + socket.id);
  //propagate to every node the connection of a new user
  socket.broadcast.emit("server:newuser");

  //listen the client, when it sends a message of the chat
  socket.on("client:newmsg", (msg) => {
    //generate the id random
    const idMsg = refMessages.push().key;
    //here insert to messages property, the property with the id random and as a value the msg param
    refMessages.child(idMsg).set(msg);
    //here we require all the data
    refMessages.once("value", (snapshot) => {
        console.log("Retrieving data from firebase ");
        io.emit("server:loadmsgs", {
            data: snapshot.val(),
          });
    });
    
  });
});

const startServer = () => {
  httpServer.listen(port, () => {
    console.log("Running on port " + port);
  });
};

startServer();
