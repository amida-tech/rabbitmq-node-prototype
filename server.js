/** Configuration Info
 * q: name of the queue (service)
 * host: full host address of the queue (service)
 */
var q = 'auth_queue';
var host = 'amqp://localhost'
var secret = 'bad_secret';

var amqp = require('amqplib');
var jwt  = require('jsonwebtoken');

function token() {
  var userInfo = {
    id: 'dummy-id',
    username: 'dummy-username',
    email: 'dummy@email.com'
  };

  return jwt.sign(userInfo, secret);
}

amqp.connect(host).then(function (conn) {
  process.once('SIGINT', function () { conn.close(); });
  return conn.createChannel().then(function (ch) {
    var ok = ch.assertQueue(q, { durable: false });
    var ok = ok.then(function () {
      ch.prefetch(1);
      return ch.consume(q, reply);
    });
    return ok.then(function () {
      console.log(' [x] Awaiting RPC requests');
    });

    function reply(msg) {
      var n = parseInt(msg.content.toString());
      console.log(' [.] token request');
      var response = token();
      ch.sendToQueue(msg.properties.replyTo,
        Buffer.from(response.toString()),
        { correlationId: msg.properties.correlationId });
      ch.ack(msg);
    }
  });
}).catch(console.warn);
