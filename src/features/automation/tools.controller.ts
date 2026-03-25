import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import type { ToolRegistry } from '@core/tools/tool-registry.service';

@Controller('tools')
export class ToolsController {
  readonly getTools: () => any;
  readonly execute: (name: string, args: any) => Promise<any>;

  constructor(@Inject('TOOL_REGISTRY') toolRegistry: ToolRegistry) {
    this.getTools = () => toolRegistry.getAllDefinitions();
    this.execute = (name: string, args: any) => toolRegistry.executeTool(name, args);
  }

  @Get()
  handleGetTools() {
    return this.getTools();
  }

  @Post('execute/:name')
  handleExecute(@Param('name') name: string, @Body() args: any) {
    return this.execute(name, args);
  }
}
