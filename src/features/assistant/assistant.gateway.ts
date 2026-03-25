import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AssistantService } from './assistant.service';

const handleStream = (client: Socket) => ({
  next: (chunk: string) => client.emit('chat-chunk', chunk),
  error: (err: Error) => client.emit('chat-error', err.message),
  complete: () => client.emit('chat-complete'),
});

@WebSocketGateway({ cors: { origin: '*' } })
export class AssistantGateway {
  @WebSocketServer()
  server: Server;

  readonly handleAskEvent: (data: { prompt: string; provider?: string }, client: Socket) => void;

  constructor(assistantService: AssistantService) {
    this.handleAskEvent = (data, client) => {
      assistantService.askStream(data.prompt, data.provider).subscribe(handleStream(client));
    };
  }

  @SubscribeMessage('ask')
  handleAsk(
    @MessageBody() data: { prompt: string; provider?: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleAskEvent(data, client);
  }
}
