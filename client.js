/** Configuration Info
 * q: name of the queue (service)
 * host: full host address of the queue (service)
 */
var q = 'auth_queue';
var host = 'amqp://localhost'

var amqp = require('amqplib');
var basename = require('path').basename;
var Promise = require('bluebird');
var uuid = require('node-uuid');

amqp.connect(host).then(function(conn) {
  return conn.createChannel().then(function(ch) {
    return new Promise(function(resolve) {
      var corrId = uuid();
      
      function maybeAnswer(msg) {
        if (msg.properties.correlationId === corrId) {
          resolve(msg.content.toString());
        }
      }

      var ok = ch
               .assertQueue('', {exclusive: true})
               .then(function(qok) { return qok.queue; });

      ok = ok.then(function(queue) {
        return ch.consume(queue, maybeAnswer, {noAck: true})
                 .then(function() { return queue; });
      });

      ok = ok.then(function(queue) {
        console.log(' [x] Requesting token');
        ch.sendToQueue(q, Buffer.from(''), {
          correlationId: corrId, replyTo: queue
        });
      });
    });
  })
  .then(function(token) {
    console.log(' [.] Got %s', token);
  })
  .finally(function() { conn.close(); });
}).catch(console.warn);
