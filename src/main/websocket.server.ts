import { WebSocketServer, WebSocket } from 'ws';
import { insertMessage, updateChatLastMessage } from './database.service';
import { securityService } from './security.service';

export interface NewMessageEvent {
  chatId: number;
  messageId: number;
  ts: number;
  sender: string;
  body: string;
}

export class SyncServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private messageInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private port: number = 8080) {}

  start(): void {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      this.clients.add(ws);

      // Send initial connection acknowledgment
      ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch (error) {
          const sanitized = securityService.sanitizeForLog(error);
          console.error('WebSocket message error:', sanitized);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        const sanitized = securityService.sanitizeForLog(error);
        console.error('WebSocket error:', sanitized);
        this.clients.delete(ws);
      });
    });

    // Start periodic message emission (every 1-3 seconds)
    this.startMessageEmitter();

    // Start heartbeat (every 10 seconds)
    this.startHeartbeat();

    console.log(`WebSocket server started on port ${this.port}`);
  }

  private startMessageEmitter(): void {
    const emitMessage = () => {
      if (this.clients.size === 0) return;

      const chatId = Math.floor(Math.random() * 200) + 1;
      const messageId = Date.now();
      const ts = Date.now();
      const sender = this.getRandomSender();
      const body = this.getRandomMessage();

      const event: NewMessageEvent = {
        chatId,
        messageId,
        ts,
        sender,
        body
      };

      // Insert into database
      insertMessage({ id: messageId, chatId, ts, sender, body });
      updateChatLastMessage(chatId, ts);

      // Broadcast to all clients (sanitize for logs)
      const sanitized = securityService.sanitizeForLog(event);
      console.log('Broadcasting new message:', sanitized);

      this.broadcast({ type: 'new_message', data: event });

      // Schedule next message (1-3 seconds)
      const delay = Math.random() * 2000 + 1000;
      this.messageInterval = setTimeout(emitMessage, delay);
    };

    emitMessage();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({ type: 'heartbeat', timestamp: Date.now() });
    }, 10000);
  }

  private broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public simulateDisconnect(): void {
    console.log('Simulating connection drop...');
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
  }

  stop(): void {
    if (this.messageInterval) {
      clearTimeout(this.messageInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.forEach((client) => client.close());
    this.wss?.close();
    console.log('WebSocket server stopped');
  }

  private getRandomSender(): string {
    const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    return senders[Math.floor(Math.random() * senders.length)];
  }

  private getRandomMessage(): string {
    const messages = [
      'Hey, how are you?',
      'Just checking in!',
      'Did you see the latest update?',
      'Let\'s catch up soon',
      'Thanks for the help!',
      'Great work on that project',
      'See you tomorrow',
      'Can we schedule a meeting?',
      'Perfect, thanks!',
      'Looking forward to it'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
