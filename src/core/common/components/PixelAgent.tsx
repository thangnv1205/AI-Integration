import React from 'react';
import { PixelAgent as PixelAgentType } from '../../agents/interfaces/pixel-agent.interface';

interface PixelAgentProps {
  agent: PixelAgentType;
  onClick?: () => void;
}

const PixelAgent: React.FC<PixelAgentProps> = ({ agent, onClick }) => {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'working': return '#3b82f6';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'waiting': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: agent.position.x,
        top: agent.position.y,
        transition: 'all 0.5s ease-in-out',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      {/* Speech Bubble for current task */}
      {agent.status === 'working' && agent.currentTask && (
        <div style={{
          background: 'white',
          border: '2px solid black',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '10px',
          maxWidth: '120px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
        }}>
          {agent.currentTask.substring(0, 30)}...
        </div>
      )}

      {/* Pixel Art Sprite Placeholder (Animated) */}
      <div style={{
        width: '32px',
        height: '32px',
        background: getStatusColor(),
        border: '3px solid #1f2937',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
        animation: agent.status === 'working' ? 'pixel-shake 0.2s infinite' : 'pixel-float 2s infinite ease-in-out',
      }}>
        {/* Simple Eyes to look like a character */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
          <div style={{ width: '4px', height: '4px', background: 'white' }} />
          <div style={{ width: '4px', height: '4px', background: 'white' }} />
        </div>
      </div>

      {/* Name and Role */}
      <div style={{
        marginTop: '4px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        textShadow: '1px 1px 0px white',
      }}>
        {agent.name}
        <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#4b5563' }}>
          {agent.role}
        </div>
      </div>

      <style>{`
        @keyframes pixel-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pixel-shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default PixelAgent;
