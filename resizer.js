'use strict';

const zmq     = require('zmq');

const pino = require('pino');
const pretty = pino.pretty();
pretty.pipe(process.stdout);
const log = pino({
  name: 'resizer',
  safe: true
}, pretty);

const socketPull  = zmq.socket('pull');
const socketPush  = zmq.socket('push');
const Jimp = require("jimp");
const PULL_PORT = process.env.PULL_PORT || 'tcp://127.0.0.1:3001';
const PUSH_PORT = process.env.PUSH_PORT || 'tcp://127.0.0.1:3002';

socketPull.connect(PULL_PORT);
socketPush.bindSync(PUSH_PORT);


socketPull.on('message', function(contextId, data) {
  log.info({
    pattern: 'PULL',
    socket: PULL_PORT,
    contextId: contextId.toString(),
    message: 'Receiving image from MAIN'
  });
  Jimp.read(data, (err, image)=>{
    if (err) throw err;

    image.resize(300,300);
    image.getBuffer(Jimp.MIME_PNG, (err, data)=>{
      if (err) throw err;
      log.info({
        pattern: 'PUSH',
        socket: PUSH_PORT,
        contextId: contextId.toString(),
        message: 'Sending image to FILTER'
      });
      socketPush.send([contextId,data]);
    });
  });
});
