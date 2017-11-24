const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

// Init Nexmo
const nexmo = new Nexmo({
  apiKey: 'a4c837eb',
  apiSecret: '8fa321473be46aee'
}, {
  debug: true
});

// Init App
const app = express();

// Template Engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Static folder
app.use(express.static(__dirname + '/public'));

// Body Parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json());

// Index route
app.get('/', (req, res, next) => {
  res.render('index');
})

// Catch POST form submit
app.post('/', (req, res) => {
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
    '380504867776', number, text, {
      type: 'unicode'
    },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
        // Get Data from response
        const data = {
          id: responseData.messages[0]['message-id'],
          number: responseData.messages[0]['to']
        }

        // Emit to the client
        io.emit('smsStatus', data); 
      }
    }
  );
})

// Define Port
const port = 3000;

// Start Server
const server = app.listen(port, () =>
  console.log(`Server Started on Port ${port}`));

// Connect to Socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
})