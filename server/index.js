const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
var MongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://test:test@cluster0.vo62q.mongodb.net/irc?retryWrites=true&w=majority";

const { addUser, removeUser, getUser, getUsersInRoom, addRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'BOT', text: `${user.name}, Bienvenue dans la niche ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'BOT', text: `${user.name} a rejoins!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("irc");
      console.log("Database connected")
      dbo.collection("customers").insertOne({
        name: user.name,
      },
        dbo.collection("rooms").insertOne({
          room: user.room,
        }),
        function (err) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });

    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const nick = ("/nick");
    const create = ("/create");
    const list = ('/list');
    const users = ('/users');
    const del = ('/delete');
    const quit = ('/quit')
    const words = message.split(' ');

    io.to(user.room).emit('message', { user: user.name, text: message });
    //==========================================RENAME=========================================================================
    if (message.startsWith(nick)) {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        var myquery = { name: user.name };
        var newvalues = { $set: { name: words[1] } };
        dbo.collection("customers").updateOne(myquery, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
      });
    }
    //==========================================CREATE=========================================================================

    if (message.startsWith(create)) {
      const { error } = addRoom({ room: words[1] });
      if (error) return callback(error);
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        console.log("Database connected")
        dbo.collection("rooms").insertOne({
          room: words[1],
        },
          function (err) {
            if (err) throw err;
            socket.emit('message', { user: 'ADMIN', text: `${user.name}, vien de créer la room ${words[1]}.` });
            console.log("1 document inserted");
            db.close();
          });

      });
    }
    //==========================================LIST========================================================================
    if (message.startsWith(list)) {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        dbo.collection("rooms").find({}, { projection: { _id: 0, room: 1 } }).toArray(function (err, result) {
          if (err) throw err;
          socket.emit('message', { user: 'ADMIN', text: JSON.stringify(result) });
          console.log(result);
          db.close();
        });
      });
    }

     //==========================================USERS========================================================================

    if (message.startsWith(users)) {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        dbo.collection("customers").find({}, { projection: { _id: 0, name: 1 } }).toArray(function (err, result) {
          if (err) throw err;
          socket.emit('message', { user: 'ADMIN', text: JSON.stringify(result) });
          db.close();
        });
      });
    }

    //==========================================DELETE=======================================================================

    if (message.startsWith(del)) {
      const { error } = addRoom({ room: words[1] });
      if (error) return callback(error);
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        console.log("Database connected")
        dbo.collection("rooms").deleteOne({
          room: words[1],
        },
          function (err) {
            if (err) throw err;
            socket.emit('message', { user: 'ADMIN', text: `${user.name}, vien de supprimer la room ${words[1]}.` });
            console.log("1 document inserted");
            db.close();
          });

      });
    }

    if (message.startsWith(quit)) {
      const user = removeUser(socket.id);

      if (user) {
        io.to(user.room).emit('message', { user: 'BOT', text: `${user.name} à deconnecté ` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
      }
      app.get('/', function (req, res) {
        res.send('GET request to the homepage');
      });
      app.post('/', function (req, res) {
        res.redirect('/');
      });
    }
    callback();

  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'BOT', text: `${user.name} ` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

      //==========================================DELETE USER IN DB=========================================================================

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("irc");
        console.log("Database connected")
        dbo.collection("customers").deleteOne({
          name: user.name,
        },
          function (err) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          });

      });
    }

  })
});

server.listen(process.env.PORT || 5200, () => console.log(`Server has started on port 5200.`));