import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PixelAgentService } from '../../core/agents/pixel-agent.service';
import { PixelAgent } from '../../core/agents/interfaces/pixel-agent.interface';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'pixel-agents' })
export class PixelAgentGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pixelAgentService: PixelAgentService) {}

  afterInit() {
    this.pixelAgentService.agents$.subscribe((agents) => {
      this.server.emit('pixel-agent:sync', agents);
    });
  }

  @SubscribeMessage('pixel-agent:spawn')
  handleSpawn(@MessageBody() data: { templateId: string }) {
    this.pixelAgentService.spawnSwarm(data.templateId);
  }

  @SubscribeMessage('pixel-agent:assign-task')
  async handleAssignTask(
    @MessageBody() data: { agentId: string; task: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.pixelAgentService.executeTask(data.agentId, data.task);
      client.emit('pixel-agent:task-result', { agentId: data.agentId, result });
    } catch (error) {
      client.emit('pixel-agent:error', { agentId: data.agentId, message: error.message });
    }
  }

  @SubscribeMessage('pixel-agent:update-config')
  handleUpdateConfig(@MessageBody() data: { agentId: string; config: Partial<PixelAgent> }) {
    this.pixelAgentService.updateConfig(data.agentId, data.config);
  }

  @SubscribeMessage('pixel-agent:move')
  handleMove(@MessageBody() data: { agentId: string; position: { x: number; y: number } }) {
    this.pixelAgentService.updateConfig(data.agentId, { position: data.position });
  }
}
