import { Module } from '@nestjs/common';
import { AiEngineModule } from './ai-engine/ai-engine.module';
import { AgentsModule } from './agents/agents.module';
import { createEmbeddings } from './embeddings/embeddings.service';
import { createVectorStore } from './vector-store/vector-store.service';
import { createToolRegistry } from './tools/tool-registry.service';
import { SystemInfoTool } from './tools/system-info.tool';

@Module({
  imports: [AiEngineModule, AgentsModule],
  providers: [
    SystemInfoTool,
    {
      provide: 'EMBEDDINGS',
      useFactory: createEmbeddings,
    },
    {
      provide: 'VECTOR_STORE',
      useFactory: createVectorStore,
      inject: ['EMBEDDINGS'],
    },
    {
      provide: 'TOOL_REGISTRY',
      useFactory: (systemInfoTool: SystemInfoTool) => {
        const registry = createToolRegistry();
        registry.registerTool(systemInfoTool);
        return registry;
      },
      inject: [SystemInfoTool],
    },
  ],
  exports: [AiEngineModule, AgentsModule, 'EMBEDDINGS', 'VECTOR_STORE', 'TOOL_REGISTRY'],
})
export class CoreModule {}
