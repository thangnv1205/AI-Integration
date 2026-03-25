import React, { useState } from 'react';
import { usePixelAgents } from '../hooks/use-pixel-agents';
import PixelAgent from './PixelAgent';

const PixelOffice: React.FC = () => {
  const { agents, isConnected, spawnSwarm, assignTask, updateConfig } = usePixelAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div style={{
      width: '100%',
      height: '600px',
      background: '#e5e7eb',
      border: '4px solid #1f2937',
      position: 'relative',
      overflow: 'hidden',
      imageRendering: 'pixelated',
      fontFamily: 'monospace',
    }}>
      {/* Header / Status */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(255,255,255,0.8)',
        padding: '8px',
        border: '2px solid black',
        zIndex: 100,
        boxShadow: '4px 4px 0px black',
      }}>
        Connection: {isConnected ? '✅ Online' : '❌ Offline'}
        <br />
        <button
          onClick={() => spawnSwarm('journey-to-the-west')}
          style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          🚀 Spawn Journey to the West
        </button>
      </div>

      {/* Agents Rendering */}
      {agents.map(agent => (
        <PixelAgent
          key={agent.id}
          agent={agent}
          onClick={() => setSelectedAgentId(agent.id)}
        />
      ))}

      {/* Control Panel (Glassmorphism) */}
      {selectedAgent && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          width: '300px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          zIndex: 200,
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Agent: {selectedAgent.name}</h3>

          {/* Role & Model Config */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '10px' }}>Model:</label>
            <select
              value={selectedAgent.model}
              onChange={(e) => updateConfig(selectedAgent.id, { model: e.target.value })}
              style={{ width: '100%', padding: '4px', marginBottom: '8px' }}
            >
              <option value="deepseek-r1:1.5b">Deepseek 1.5b</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3-5-sonnet">Claude 3.5</option>
            </select>
          </div>

          {/* Task Assignment */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '10px' }}>Assign Task:</label>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter task..."
              style={{ width: '100%', height: '60px', padding: '4px', marginBottom: '8px', border: '1px solid #ccc' }}
            />
            <button
              onClick={() => {
                assignTask(selectedAgent.id, taskInput);
                setTaskInput('');
              }}
              disabled={selectedAgent.status === 'working'}
              style={{
                width: '100%',
                padding: '8px',
                background: selectedAgent.status === 'working' ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {selectedAgent.status === 'working' ? 'Working...' : 'Run Task'}
            </button>
          </div>

          <button
            onClick={() => setSelectedAgentId(null)}
            style={{ fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            Close Panel
          </button>
        </div>
      )}

      {/* Grid Floor Pattern */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
        opacity: 0.3,
      }} />
    </div>
  );
};

export default PixelOffice;
