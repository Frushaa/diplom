const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

function setupWebSocket(server) {
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    const userId = request.url.split('/').pop();
    clients.set(userId, ws);

    ws.on('close', () => {
      clients.delete(userId);
    });
  });
}

function sendNotification(userId, data) {
  const client = clients.get(userId.toString());
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
    return true;
  }
  return false;
}

module.exports = {
  setupWebSocket,
  sendNotification
};