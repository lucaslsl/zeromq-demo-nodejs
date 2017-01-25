'use strict';

const zmq     = require('zmq');
// const pino = require('pino')();

const pino = require('pino');
const pretty = pino.pretty();
pretty.pipe(process.stdout);
const log = pino({
  name: 'filter',
  safe: true
}, pretty);

const Jimp = require("jimp");
const socketPull  = zmq.socket('pull');
const socketPair = zmq.socket('pair');
const PULL_PORT = process.env.PULL_PORT || 'tcp://127.0.0.1:3002';
const PAIR_PORT = process.env.PAIR_PORT || 'tcp://127.0.0.1:3003';

socketPull.connect(PULL_PORT);
socketPair.connect(PAIR_PORT);

socketPull.on('message', function(contextId, data) {
  log.info({
    pattern: 'PULL',
    socket: PULL_PORT,
    contextId: contextId.toString(),
    message: 'Receiving image from RESIZER'
  });
  Jimp.read(data, (err, image)=>{
    if (err) throw err;

    image.greyscale();
    // image.greyscale().write('img.png');

    image.getBuffer(Jimp.MIME_PNG, (err, data)=>{
      if (err) throw err;
      log.info({
        pattern: 'PAIR',
        socket: PAIR_PORT,
        contextId: contextId.toString(),
        message: 'Sending result image to MAIN'
      });
      socketPair.send([contextId,data]);

    });

  });
});