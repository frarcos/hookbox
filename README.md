# HookBox 🪝📦

A beautiful real-time HTTP request monitoring service built with Next.js, Express.js, and WebSockets.

## Features

- **Universal Endpoint**: Accept any HTTP method (GET, POST, PUT, DELETE, etc.) at `/in/<your-key>`
- **Real-time Monitoring**: Watch incoming requests instantly via WebSocket connections
- **Beautiful UI**: Modern interface built with shadcn/ui and Tailwind CSS
- **Docker Ready**: Complete containerized setup with docker-compose
- **Multi-Key Support**: Multiple users can monitor different keys simultaneously

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. **Create environment file**
   
   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
   NEXT_PUBLIC_WS_URL=ws://localhost:4000
   ```

2. **Start the services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

### Local Development

1. **Backend setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env.local with the environment variables above
   
   npm run dev
   ```

## How to Use

### 1. Get Your Monitoring Key

1. Visit http://localhost:3000
2. Enter any unique key (e.g., "my-webhook", "test-123")
3. Click "Start Watching"

### 2. Send Requests to Monitor

Send HTTP requests to your endpoint:
```bash
# Your endpoint format
http://localhost:4000/in/<your-key>

# Examples
curl -X POST http://localhost:4000/in/my-webhook \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello HookBox!"}'

curl -X GET http://localhost:4000/in/my-webhook?param=value

curl -X PUT http://localhost:4000/in/my-webhook \
  -H "Authorization: Bearer token123" \
  -d "some data"
```

### 3. Watch Real-time Results

The watch page will display:
- HTTP method and timestamp
- All request headers
- Request body (if present)
- Source IP address
- Real-time connection status

## API Reference

### Universal Endpoint

**Endpoint**: `POST|GET|PUT|DELETE|PATCH /in/:key`

Accepts any HTTP method and forwards the request details to WebSocket clients watching that key.

**Response**:
```json
{
  "status": "sent",
  "key": "your-key"
}
```

### WebSocket Connection

**Endpoint**: `ws://localhost:4000/ws?key=<your-key>`

Receives real-time request data in this format:
```json
{
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "user-agent": "curl/7.68.0"
  },
  "body": {
    "message": "Hello HookBox!"
  },
  "source": "::1",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │     HookBox     │    │   Watch Page    │
│                 │    │                 │    │                 │
│                 │───▶│  POST /in/key   │───▶│   WebSocket     │
│                 │    │                 │    │   Connection    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Real-time     │
                       │   Display       │
                       └─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, WebSocket (ws), CORS
- **Infrastructure**: Docker, Docker Compose

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_BACKEND_URL`: Backend API base URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

### Backend
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode

## Production Deployment

For production, update your environment variables:

```env
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```

And configure your reverse proxy/load balancer to handle WebSocket upgrades.

## Use Cases

- **Webhook Testing**: Test webhooks from services like GitHub, Stripe, etc.
- **API Development**: Monitor API calls during development
- **Integration Testing**: Verify third-party service integrations
- **Request Debugging**: Inspect headers, payloads, and timing
- **IoT Data Collection**: Monitor data from IoT devices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
