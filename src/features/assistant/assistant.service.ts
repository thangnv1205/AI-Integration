import { Injectable, Inject } from '@nestjs/common';
import type { AiEngine } from '@core/ai-engine/ai-engine.service';
import type { VectorStore } from '@core/vector-store/vector-store.service';
import { buildAugmentedPrompt } from '@core/common/utils/ai.utils';
import { OrchestratorAgent } from '@core/agents/orchestrator.agent';
import { SwarmRegistry } from '@core/agents/swarm-registry.service';
import { CommandGroup } from '@core/agents/interfaces/command-group.interface';

// Pure Functions — all actual logic is here, no class, no `this`

const ask = (aiEngine: AiEngine) => (prompt: string, provider = 'ollama', model?: string) =>
  aiEngine.generateResponse(provider, prompt, { model });

const askWithContext =
  (aiEngine: AiEngine, vectorStore: VectorStore) =>
  async (prompt: string, provider = 'ollama', model?: string) => {
    const contextDocs = await vectorStore.search(prompt);
    const contextText = contextDocs.map((d) => d.text).join('\n---\n');
    return aiEngine.generateResponse(provider, buildAugmentedPrompt(contextText, prompt), { model });
  };

const learn = (vectorStore: VectorStore) => (text: string, metadata: any = {}) =>
  vectorStore.addDocument(text, metadata);

const askStream = (aiEngine: AiEngine) => (prompt: string, provider = 'ollama', model?: string) =>
  aiEngine.generateStream(provider, prompt, { model });

const getProviders = (aiEngine: AiEngine) => () => aiEngine.getAvailableProviders();

const runSwarm = (orchestrator: OrchestratorAgent) => (task: string) => {
  orchestrator.setInteractive(false);
  return orchestrator.orchestrate(task);
};

const runSwarmStep = (orchestrator: OrchestratorAgent) => (task: string) => {
  orchestrator.setInteractive(true);
  return orchestrator.orchestrate(task);
};

const executeNextStep = (orchestrator: OrchestratorAgent) => () => orchestrator.executeNextStep();

const getSwarmRoles = (orchestrator: OrchestratorAgent) => () => orchestrator.getRoles();

const updateSwarmRoleModel = (orchestrator: OrchestratorAgent) => (roleId: string, model: string) => 
  orchestrator.updateRoleModel(roleId, model);

const setSwarm = (orchestrator: OrchestratorAgent) => (templateId: string) => orchestrator.setTemplate(templateId);

const listSwarms = (swarmRegistry: SwarmRegistry) => () => swarmRegistry.getAllTemplates();

const listCommandGroups = () => (): CommandGroup[] => [
  {
    id: 'software-flow',
    name: 'Quy trình phần mềm',
    description: 'Nghiên cứu DSA -> Viết code Warehouse -> Review Security',
    steps: [
      'Nghiên cứu ứng dụng DSA vào quản lý kho hàng',
      'Viết code ví dụ về cấu trúc dữ liệu kho hàng',
      'Review bảo mật cho đoạn code vừa viết'
    ]
  }
];

// Thin class — only needed for NestJS DI, delegates everything to pure functions above
@Injectable()
export class AssistantService {
  readonly ask: ReturnType<typeof ask>;
  readonly askWithContext: ReturnType<typeof askWithContext>;
  readonly learn: ReturnType<typeof learn>;
  readonly askStream: ReturnType<typeof askStream>;
  readonly getProviders: ReturnType<typeof getProviders>;
  readonly runSwarm: ReturnType<typeof runSwarm>;
  readonly runSwarmStep: ReturnType<typeof runSwarmStep>;
  readonly executeNextStep: ReturnType<typeof executeNextStep>;
  readonly setSwarm: ReturnType<typeof setSwarm>;
  readonly listSwarms: ReturnType<typeof listSwarms>;
  readonly listCommandGroups: ReturnType<typeof listCommandGroups>;
  readonly getSwarmRoles: ReturnType<typeof getSwarmRoles>;
  readonly updateSwarmRoleModel: ReturnType<typeof updateSwarmRoleModel>;

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    @Inject('VECTOR_STORE') vectorStore: VectorStore,
    orchestrator: OrchestratorAgent,
    swarmRegistry: SwarmRegistry,
  ) {
    this.ask = ask(aiEngine);
    this.askWithContext = askWithContext(aiEngine, vectorStore);
    this.learn = learn(vectorStore);
    this.askStream = askStream(aiEngine);
    this.getProviders = getProviders(aiEngine);
    this.runSwarm = runSwarm(orchestrator);
    this.runSwarmStep = runSwarmStep(orchestrator);
    this.executeNextStep = executeNextStep(orchestrator);
    this.getSwarmRoles = getSwarmRoles(orchestrator);
    this.updateSwarmRoleModel = updateSwarmRoleModel(orchestrator);
    this.setSwarm = setSwarm(orchestrator);
    this.listSwarms = listSwarms(swarmRegistry);
    this.listCommandGroups = listCommandGroups();
  }
}
