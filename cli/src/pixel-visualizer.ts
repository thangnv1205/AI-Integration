import { io, Socket } from 'socket.io-client';
import chalk from 'chalk';
import readline from 'readline';

interface PixelAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  position: { x: number; y: number };
  spriteId: string;
  currentTask?: string;
}

export const startPixelVisualizer = (baseUrl: string): Promise<void> => {
  return new Promise((resolve) => {
    const socket: Socket = io(`${baseUrl}/pixel-agents`);
    let agents: PixelAgent[] = [];
    let lastRendered = '';

    const clearScreen = () => process.stdout.write('\x1b[2J\x1b[H');

    const render = () => {
      let output = '';
      output += chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗\n');
      output += chalk.cyan.bold('║              🏢 PIXEL AGENT OFFICE (TERMINAL)                ║\n');
      output += chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝\n');
      output += chalk.gray('  [ Q: Thoát | S: Gọi đội hình Tây Du | R: Làm mới ]\n\n');

      if (agents.length === 0) {
        output += chalk.yellow('  ⚠️ Hiện chưa có Agent nào hoạt động.\n');
        output += chalk.gray('  Nhấn [S] để gọi đội hình "Hành trình Tây Du"...\n');
      } else {
        // Draw Grid
        const gridWidth = 40;
        const gridHeight = 10;

        for (let r = 0; r < gridHeight; r++) {
          let line = '  ';
          for (let c = 0; c < gridWidth; c++) {
            let char = chalk.gray('·');
            
            // Tìm agent trong ô này (mapping x,y sang grid)
            // Tỷ lệ: x(0-800) -> c(0-40), y(0-600) -> r(0-10)
            const agentAtPos = agents.find(a => {
              const ax = Math.floor(a.position.x / 20);
              const ay = Math.floor(a.position.y / 60);
              return ax === c && ay === r;
            });

            if (agentAtPos) {
              const sprite = agentAtPos.spriteId === 'king' ? '🤴' : '🐒';
              const statusColor = agentAtPos.status === 'working' ? chalk.blue : 
                                 agentAtPos.status === 'success' ? chalk.green :
                                 agentAtPos.status === 'error' ? chalk.red : chalk.white;
              char = statusColor(sprite);
            }
            line += char + ' ';
          }
          output += line + '\n';
        }

        output += chalk.cyan('\n📋 Danh sách Agent:\n');
        agents.forEach(a => {
          const icon = a.status === 'working' ? '⏳' : a.status === 'success' ? '✅' : '💤';
          output += `  ${icon} ${chalk.bold(a.name.padEnd(15))} | ${chalk.italic(a.role.padEnd(12))} | ${chalk.yellow(a.status.padEnd(8))} ${a.currentTask ? `\n    └─ 💭 ${chalk.gray(a.currentTask.substring(0, 50))}` : ''}\n`;
        });
      }

      if (output !== lastRendered) {
        clearScreen();
        process.stdout.write(output);
        lastRendered = output;
      }
    };

    socket.on('connect', () => {
      render();
    });

    socket.on('pixel-agent:sync', (data: PixelAgent[]) => {
      agents = data;
      render();
    });

    // Handle Input
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: true
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'q') {
        socket.close();
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        resolve();
      } else if (key.name === 's') {
        socket.emit('pixel-agent:spawn', { templateId: 'journey-to-the-west' });
      } else if (key.name === 'r') {
        render();
      }
    });
  });
};
