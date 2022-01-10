"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var admin = _interopRequireWildcard(require("firebase-admin"));

var _express = _interopRequireDefault(require("express"));

var _http = require("http");

var _socket = require("socket.io");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var dotenv = require("dotenv");

var app = (0, _express["default"])();
var httpServer = (0, _http.createServer)(app);
var io = new _socket.Server(httpServer);
var port = process.env.PORT || 3000; //env variables

dotenv.config(); //serialize json credentials for google

var credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS); //firebase variables

var db = null;
var refMessages = null; //begin the connection with realtime database

try {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: process.env.DB_URI
  });
  db = admin.database();
  refMessages = db.ref("/messages");
  console.log("DB connected");
} catch (error) {
  console.log("DB error " + error);
} //serve the static files from public folder


app.use(_express["default"]["static"](__dirname + "/public")); //in connection event on ws server, we config the behavior for every socket client that connects with it

io.on("connection", function (socket) {
  console.log("new connection: " + socket.id); //propagate to every node the connection of a new user

  socket.broadcast.emit("server:newuser"); //listen the client, when it sends a message of the chat

  socket.on("client:newmsg", function (msg) {
    //generate the id random
    var idMsg = refMessages.push().key; //here insert to messages property, the property with the id random and as a value the msg param

    refMessages.child(idMsg).set(msg); //here we require all the data

    refMessages.once("value", function (snapshot) {
      console.log("Retrieving data from firebase ");
      io.emit("server:loadmsgs", {
        data: snapshot.val()
      });
    });
  });
});

var startServer = function startServer() {
  httpServer.listen(port, function () {
    console.log("Running on port " + port);
  });
};

startServer();