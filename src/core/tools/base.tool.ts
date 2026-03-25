export interface ToolProperty {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolProperty>;
    required: string[];
  };
}

export abstract class BaseTool {
  abstract definition: ToolDefinition;
  abstract execute(args: any): Promise<any>;
}
