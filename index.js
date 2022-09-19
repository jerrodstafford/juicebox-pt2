
require('dotenv').config();

const express = require('express');
const server = express();

const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json());

const apiRouter = require('./api');
server.use('/api', apiRouter);


const { client } = require('./db');
client.connect();

const PORT = 3000;
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});