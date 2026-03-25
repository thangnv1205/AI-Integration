export type PixelAgentStatus = 'idle' | 'working' | 'waiting' | 'moving' | 'success' | 'error';

export interface PixelAgentPosition {
  x: number;
  y: number;
}

export interface PixelAgent {
  id: string;
  name: string;
  role: string;
  provider: string;
  model: string;
  status: PixelAgentStatus;
  currentTask?: string;
  position: PixelAgentPosition;
  spriteId: string;
  scale?: number;
}
