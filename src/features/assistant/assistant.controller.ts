import { Controller, Post, Body, Get } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  ask(@Body() body: { prompt: string; provider?: string; model?: string }) {
    return this.assistantService.ask(body.prompt, body.provider, body.model);
  }

  @Post('ask-with-context')
  askWithContext(@Body() body: { prompt: string; provider?: string; model?: string }) {
    return this.assistantService.askWithContext(body.prompt, body.provider, body.model);
  }

  @Post('learn')
  learn(@Body() body: { text: string; metadata?: any }) {
    return this.assistantService.learn(body.text, body.metadata);
  }

  @Get('providers')
  getProviders() {
    return this.assistantService.getProviders();
  }

  @Post('swarm')
  swarm(@Body() body: { task: string }) {
    return this.assistantService.runSwarm(body.task);
  }

  @Post('swarm-step')
  swarmStep(@Body() body: { task: string }) {
    return this.assistantService.runSwarmStep(body.task);
  }

  @Post('swarm-next')
  swarmNext() {
    return this.assistantService.executeNextStep();
  }

  @Get('swarm-roles')
  getSwarmRoles() {
    return this.assistantService.getSwarmRoles();
  }

  @Post('swarm-role-model')
  updateSwarmRoleModel(@Body() body: { roleId: string; model: string }) {
    this.assistantService.updateSwarmRoleModel(body.roleId, body.model);
    return { success: true };
  }

  @Get('swarms')
  listSwarms() {
    return this.assistantService.listSwarms();
  }

  @Get('command-groups')
  listCommandGroups() {
    return this.assistantService.listCommandGroups();
  }

  @Post('swarm-set')
  setSwarm(@Body() body: { templateId: string }) {
    this.assistantService.setSwarm(body.templateId);
    return { success: true, templateId: body.templateId };
  }
}
