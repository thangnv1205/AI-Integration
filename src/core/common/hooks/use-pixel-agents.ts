import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PixelAgent, PixelAgentStatus } from '../../agents/interfaces/pixel-agent.interface';

export const usePixelAgents = (url: string = 'http://localhost:3000/pixel-agents') => {
  const [agents, setAgents] = useState<PixelAgent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('pixel-agent:sync', (data: PixelAgent[]) => {
      setAgents(data);
    });

    return () => {
      newSocket.close();
    };
  }, [url]);

  const spawnSwarm = useCallback((templateId: string) => {
    socket?.emit('pixel-agent:spawn', { templateId });
  }, [socket]);

  const assignTask = useCallback((agentId: string, task: string) => {
    socket?.emit('pixel-agent:assign-task', { agentId, task });
  }, [socket]);

  const updateConfig = useCallback((agentId: string, config: Partial<PixelAgent>) => {
    socket?.emit('pixel-agent:update-config', { agentId, config });
  }, [socket]);

  const moveAgent = useCallback((agentId: string, x: number, y: number) => {
    socket?.emit('pixel-agent:move', { agentId, position: { x, y } });
  }, [socket]);

  return {
    agents,
    isConnected,
    spawnSwarm,
    assignTask,
    updateConfig,
    moveAgent,
  };
};
