import { execSync, spawn } from 'child_process';
import os from 'os';
import chalk from 'chalk';

// Pure functions for checking System and Ollama
export const checkOS = () => os.platform();

export const isOllamaInstalled = (): boolean => {
  try {
    execSync('ollama --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

export const getInstalledModels = (): string[] => {
  try {
    const output = execSync('ollama list').toString();
    const lines = output.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return []; // Only header
    // Parse models mapping like "qwen2.5:latest" to "qwen2.5"
    const models = lines.slice(1).map(l => l.split(/\s+/)[0].split(':')[0]);
    return Array.from(new Set(models));
  } catch (e) {
    return [];
  }
};

export const pullModel = (model: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan(`\n📥 Hệ thống đang tự động Pull model '${model}'... (Có thể mất vài phút tới vài chục phút tuỳ mạng)`));
    const child = spawn('ollama', ['pull', model], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Thất bại khi pull model ${model}. Mã lỗi: ${code}`));
    });
  });
};
