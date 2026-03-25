import { BaseTool, ToolDefinition } from './base.tool';

export interface ToolRegistry {
  registerTool(tool: BaseTool): void;
  getTool(name: string): BaseTool | undefined;
  getAllDefinitions(): ToolDefinition[];
  executeTool(name: string, args: any): Promise<any>;
}

export const createToolRegistry = (): ToolRegistry => {
  const tools = new Map<string, BaseTool>();

  return {
    registerTool: (tool: BaseTool): void => {
      tools.set(tool.definition.name, tool);
    },

    getTool: (name: string): BaseTool | undefined => {
      return tools.get(name);
    },

    getAllDefinitions: (): ToolDefinition[] => {
      return Array.from(tools.values()).map((t) => t.definition);
    },

    executeTool: async (name: string, args: any): Promise<any> => {
      const tool = tools.get(name);
      if (!tool) throw new Error(`Tool ${name} not found`);
      return tool.execute(args);
    },
  };
};
