
'use strict';

// Require Main Modules
const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs')); 
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const compression = require('compression');
const logger = require('morgan');
// const pino = require('pino')();

const pino = require('pino');
const pretty = pino.pretty();
pretty.pipe(process.stdout);
const log = pino({
  name: 'main',
  safe: true
}, pretty);

const Jimp = require("jimp");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileType = require('file-type');
const wrap = require('./util/generatorFnToMiddlewareFnWrapper');
const app = express();
const zmq = require('zmq');
const uuid = require('uuid');
const socketPush = zmq.socket('push');
const PUSH_PORT = process.env.PUSH_PORT || 'tcp://127.0.0.1:3001';
const socketPair = zmq.socket('pair');
const PAIR_PORT = process.env.PAIR_PORT || 'tcp://127.0.0.1:3003';

// EXPRESS CONFIGURATION ===========================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.disable('x-powered-by');

// GENERAL MIDDLEWARES =============================================
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

socketPush.bindSync(PUSH_PORT);
socketPair.bindSync(PAIR_PORT);

app.get('/', (req, res) => {
  res.render('homepage');
});

app.put('/upload-image', 

  bodyParser.raw({limit: '500kb'}),

  wrap(function* (req, res){

    let imgType = fileType(req.body);

    if(!imgType){
      return res.status(415).json({
        message: 'Invalid Image Type'
      });
    }

    /* istanbul ignore next  */
    if( imgType.mime !== 'image/png'  &&
        imgType.mime !== 'image/jpeg' &&
        imgType.mime !== 'image/gif'  &&
        imgType.mime !== 'image/tiff'
      ){
      return res.status(415).json({
        message: 'Invalid Image Type'
      });
    }

    let contextId = uuid.v4();

    log.info({
      pattern: 'PUSH',
      socket: PUSH_PORT,
      contextId: contextId,
      message: 'Sending image to RESIZER'
    });

    socketPush.send([contextId, req.body]);

    return res.status(200).json({
      status: 'processing',
      contextId: contextId
    });

  })
);

socketPair.on('message', function(contextId, data) {
  log.info({
    pattern: 'PAIR',
    socket: PAIR_PORT,
    contextId: contextId.toString(),
    message: 'Receiving result image from FILTER'
  });
  fs.writeFileAsync(`public/processed_images/${contextId.toString()}.png`, data).then(rs=>{
    return;
  });
});


module.exports = app;