const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Test Server Works!</h1><p>Si vous voyez cela, le problème ne vient pas du réseau.</p>');
});

server.listen(3040, 'localhost', () => {
  console.log('Test server running on http://localhost:3040');
});