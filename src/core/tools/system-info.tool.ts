import { BaseTool, ToolDefinition } from './base.tool';
import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class SystemInfoTool extends BaseTool {
  definition: ToolDefinition = {
    name: 'get_system_info',
    description: 'Get basic information about the host system (OS, Memory, CPU)',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  };

  async execute(): Promise<any> {
    return {
      platform: os.platform(),
      release: os.release(),
      totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      cpus: os.cpus().length,
      loadAvg: os.loadavg(),
    };
  }
}
