# rabbitmq-node-prototype

## Steps to demo an auth token exchange
1. Ensure an instance of RabbitMQ is running at `localhost`.
2. Start the server with `node server.js`.
3. Make a client request with `node client.js`.

## Visualizing the queue
With RabbitMQ and the server running, go to `http://localhost:15672/#/queues`. Click on the name of your queue.
Make another client request. You can now see the messages going to the queue in real time.
RabbitMQ will track messaging metrics over time.
