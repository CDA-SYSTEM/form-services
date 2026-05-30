import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  namespace: '/events',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    console.log(`[Socket] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[Socket] Cliente desconectado: ${client.id}`);
  }

  emitInvoiceCreated(payload: Record<string, unknown>): void {
    this.server.emit('invoice.created', payload);
  }
}
