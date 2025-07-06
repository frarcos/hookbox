const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

// Configure Express to trust proxies (important for Docker)
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket Server for pushing request data to watchers
const wss = new WebSocket.Server({ noServer: true });

// Map of key -> set of websocket clients
const clientsMap = new Map();

// Function to extract real client IP
function getClientIP(req) {
	// Check various headers that proxies might set
	const forwarded = req.headers['x-forwarded-for'];
	if (forwarded) {
		// X-Forwarded-For can contain multiple IPs, first one is the original client
		return forwarded.split(',')[0].trim();
	}
	
	// Other common headers
	return req.headers['x-real-ip'] || 
		   req.headers['x-client-ip'] || 
		   req.connection?.remoteAddress || 
		   req.socket?.remoteAddress ||
		   req.ip || 
		   'unknown';
}

// Upgrade HTTP server to handle WebSocket connections
const server = app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
	// Parse key param from URL, expect ws://localhost:4000/ws?key=xxx
	const url = new URL(request.url, `https://${request.headers.host}`);
	if (url.pathname === '/ws') {
		const key = url.searchParams.get('key');
		if (!key) {
			socket.destroy();
			return;
		}

		wss.handleUpgrade(request, socket, head, function done(ws) {
			ws.key = key;
			wss.emit('connection', ws, request);
		});
	} else {
		socket.destroy();
	}
});

wss.on('connection', (ws) => {
	const key = ws.key;
	if (!clientsMap.has(key)) {
		clientsMap.set(key, new Set());
	}
	clientsMap.get(key).add(ws);

	ws.on('close', () => {
		clientsMap.get(key).delete(ws);
		if (clientsMap.get(key).size === 0) {
			clientsMap.delete(key);
		}
	});
});

// Universal endpoint for incoming requests
app.all('/in/:key', (req, res) => {
	const key = req.params.key;

	const message = {
		method: req.method,
		headers: req.headers,
		body: req.body,
		source: getClientIP(req),
		timestamp: new Date().toISOString(),
	};

	// Broadcast message to all WebSocket clients watching this key
	const clients = clientsMap.get(key);
	if (clients && clients.size > 0) {
		const msgStr = JSON.stringify(message);
		for (const client of clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(msgStr);
			}
		}
	}

	res.json({ status: 'sent', key });
});
