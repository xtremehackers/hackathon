const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');


const app = express();

const users = require('./routes/xpo');

// Port Number
const port = process.env.PORT || 3000;


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());


app.use('/api', users);

// Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});
