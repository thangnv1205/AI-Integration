import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import readline from 'readline';
import { createApiClient } from './api-client';
import { checkOS, isOllamaInstalled, getInstalledModels, pullModel } from './utils/ollama-setup';
import { startPixelVisualizer } from './pixel-visualizer';

const BASE_URL = process.env.AI_BASE_URL || 'http://localhost:3000';
const client = createApiClient(BASE_URL);

// --- Pure helper functions ---

const printBanner = () => {
  console.log(chalk.cyan.bold('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║     🤖  AI Research CLI          ║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════╝'));
  console.log(chalk.gray(`  Backend: ${BASE_URL}`));
  console.log(chalk.gray('  Commands: /stream, /rag, /learn, /providers, /pixel, /exit\n'));
};

const printHelp = () => {
  console.log(chalk.yellow('\nAvailable commands:'));
  console.log(chalk.white('  /stream <message>  ') + chalk.gray('— Stream AI response via WebSocket'));
  console.log(chalk.white('  /rag <message>     ') + chalk.gray('— Ask with RAG context'));
  console.log(chalk.white('  /learn <text>      ') + chalk.gray('— Teach AI new knowledge'));
  console.log(chalk.white('  /providers         ') + chalk.gray('— List available AI providers'));
  console.log(chalk.white('  /model <name>      ') + chalk.gray('— Switch AI model dynamically'));
  console.log(chalk.magenta('  /swarm <task>      ') + chalk.gray('— 🧘 Gọi đội hình AI (Tự động)'));
  console.log(chalk.magenta('  /swarm-step <task> ') + chalk.gray('— 🐾 Chế độ từng bước (Manual)'));
  console.log(chalk.magenta('  /step              ') + chalk.gray('— ➡️  Thực thi bước tiếp theo'));
  console.log(chalk.magenta('  /swarms            ') + chalk.gray('— 📋 Danh sách các mô hình đội hình'));
  console.log(chalk.magenta('  /swarm-set <id>    ') + chalk.gray('— 🔄 Đổi đội hình (vd: software-team)'));
  console.log(chalk.magenta('  /roles             ') + chalk.gray('— 🎭 Cấu hình Model cho từng Agent'));
  console.log(chalk.magenta('  /groups            ') + chalk.gray('— 📑 Danh sách các nhóm lệnh/kịch bản'));
  console.log(chalk.magenta('  /group <id>        ') + chalk.gray('— 🚀 Chạy một nhóm lệnh/kịch bản'));
  console.log(chalk.white('  /pixel             ') + chalk.gray('— 🏢 Visualizer Pixel Agents in Terminal'));
  console.log(chalk.white('  /help              ') + chalk.gray('— Show this help'));
  console.log(chalk.white('  /exit              ') + chalk.gray('— Quit\n'));
};

const formatResponse = (text: string, timeMs?: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }) => {
  const timeStr = timeMs ? chalk.gray(`  [⏱️ ${(timeMs / 1000).toFixed(2)}s]`) : '';
  const usageStr = usage 
    ? chalk.gray(`\n  [🔥 Tokens: `) + 
      chalk.yellow(`${usage.promptTokens}`) + chalk.gray(' in | ') + 
      chalk.cyan(`${usage.completionTokens}`) + chalk.gray(' out | ') + 
      chalk.green.bold(`${usage.totalTokens}`) + chalk.gray(' total]')
    : '';
  return chalk.green('\n🤖 AI: ') + chalk.white(text) + timeStr + usageStr + '\n';
};

const streamResponse = (prompt: string, provider: string, model: string | undefined): Promise<void> => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    process.stdout.write(chalk.green('\n🤖 AI: '));
    client.streamAsk(
      prompt,
      provider,
      model,
      (chunk) => process.stdout.write(chalk.white(chunk)),
      () => {
        const timeMs = Date.now() - start;
        process.stdout.write(chalk.gray(`  [⏱️ ${(timeMs / 1000).toFixed(2)}s]\n\n`));
        resolve();
      },
      (err) => {
        console.error(chalk.red(`\n❌ Stream error: ${err}`));
        reject(err);
      },
    );
  });
};

// --- Command handlers (pure functions) ---

const handleStream = async (args: string, provider: string, model: string | undefined) => {
  const prompt = args.trim();
  if (!prompt) return console.log(chalk.yellow('Usage: /stream <message>'));
  await streamResponse(prompt, provider, model);
};

const handleRag = async (args: string, provider: string, model: string | undefined) => {
  const prompt = args.trim();
  if (!prompt) return console.log(chalk.yellow('Usage: /rag <message>'));
  const spinner = ora('Searching knowledge base...').start();
  const start = Date.now();
  try {
    const res = await client.askWithContext(prompt, provider, model);
    spinner.stop();
    console.log(formatResponse(res.text, Date.now() - start, res.usage));
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message;
    spinner.fail(chalk.red(`Error: ${errorMsg}`));
  }
};

const handleLearn = async (args: string) => {
  const text = args.trim();
  if (!text) return console.log(chalk.yellow('Usage: /learn <text>'));
  const spinner = ora('Adding to knowledge base...').start();
  const start = Date.now();
  try {
    await client.learn(text);
    spinner.succeed(chalk.green(`Knowledge saved! `) + chalk.gray(`[⏱️ ${((Date.now() - start) / 1000).toFixed(2)}s]`));
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message;
    spinner.fail(chalk.red(`Error: ${errorMsg}`));
  }
};

const handleProviders = async () => {
  const spinner = ora('Fetching providers...').start();
  try {
    const providers = await client.getProviders();
    spinner.stop();
    console.log(chalk.cyan('\nAvailable providers:'));
    providers.forEach((p) => console.log(`  ${chalk.green('●')} ${p}`));
    console.log();
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message;
    spinner.fail(chalk.red(`Error: ${errorMsg}`));
  }
};

const handleListSwarms = async () => {
  const spinner = ora('Fetching swarm templates...').start();
  try {
    const swarms = await client.listSwarms();
    spinner.stop();
    console.log(chalk.cyan('\nAvailable Swarm teams:'));
    swarms.forEach((s) => {
      console.log(`${chalk.magenta('●')} ${chalk.bold(s.id)}: ${s.name}`);
      console.log(chalk.gray(`  └─ ${s.description}`));
    });
    console.log();
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleSwarmSet = async (args: string) => {
  let templateId = args.trim();
  
  if (!templateId) {
    const swarms = await client.listSwarms();
    const result = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: 'Chọn đội hình (Swarm Template):',
        choices: swarms.map(s => ({ name: `${s.name} (${s.description})`, value: s.id }))
      }
    ]);
    templateId = result.templateId;
  }

  const spinner = ora(`Đang chuyển sang đội hình: ${templateId}...`).start();
  try {
    await client.setSwarm(templateId);
    spinner.succeed(chalk.green(`Đã chuyển sang đội hình: ${templateId}`));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleSwarmRoles = async () => {
  const spinner = ora('Đang lấy danh sách các Agent...').start();
  try {
    const roles = await client.getSwarmRoles();
    spinner.stop();

    if (roles.length === 0) {
      return console.log(chalk.yellow('⚠️ Cần chọn một đội hình (Swarm) trước khi cấu hình roles.\n'));
    }

    const { roleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Chọn Agent muốn đổi Model:',
        choices: roles.map(r => ({ 
          name: `${chalk.bold(r.name)} (${r.id}) — hiện tại: ${chalk.cyan(r.currentModel)}`, 
          value: r.id 
        }))
      }
    ]);

    const installedModels = getInstalledModels();
    const { selectedModel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedModel',
        message: `Chọn Model cho Agent [${roleId}]:`,
        choices: [...installedModels, new inquirer.Separator(), 'Nhập tên khác...']
      }
    ]);

    let finalModel = selectedModel;
    if (selectedModel === 'Nhập tên khác...') {
      const extra = await inquirer.prompt([{ type: 'input', name: 'name', message: 'Tên model mới:' }]);
      finalModel = extra.name;
    }

    const updateSpinner = ora(`Đang gán model ${finalModel} cho ${roleId}...`).start();
    await client.updateSwarmRoleModel(roleId, finalModel);
    updateSpinner.succeed(chalk.green(`Đã gán model ${finalModel} cho Agent ${roleId}!`));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleSwarm = async (args: string) => {
  let task = args.trim();
  
  if (!task) {
    const swarms = await client.listSwarms();
    const { templateId, inputTask } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: 'Chọn đội hình thực thi:',
        choices: swarms.map(s => ({ name: `${s.name} - ${s.orchestratorName}`, value: s.id }))
      },
      {
        type: 'input',
        name: 'inputTask',
        message: 'Nhập nhiệm vụ của bạn:',
        validate: (input) => input.length > 0 || 'Nhiệm vụ không được để trống'
      }
    ]);
    
    await client.setSwarm(templateId);
    task = inputTask;
  }

  console.log(chalk.magenta.bold(`\n⚡ Khởi động đội hình AI thực thi nhiệm vụ (Chế độ tự động)...`));
  const spinner = ora('Agent Swarm đang hoạt động...').start();
  const start = Date.now();
  try {
    const res = await client.runSwarm(task);
    spinner.stop();
    console.log(formatResponse(res.text, Date.now() - start, res.usage));
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message;
    spinner.fail(chalk.red(`❌ Swarm error: ${errorMsg}`));
  }
};

const handleSwarmStep = async (args: string) => {
  let task = args.trim();
  
  if (!task) {
    const swarms = await client.listSwarms();
    const { templateId, inputTask } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: 'Chọn đội hình (Step-by-step):',
        choices: swarms.map(s => ({ name: `${s.name} (${s.orchestratorName})`, value: s.id }))
      },
      {
        type: 'input',
        name: 'inputTask',
        message: 'Nhập nhiệm vụ lập kế hoạch:',
        validate: (input) => input.length > 0 || 'Nhiệm vụ không được để trống'
      }
    ]);
    
    await client.setSwarm(templateId);
    task = inputTask;
  }

  console.log(chalk.magenta.bold(`\n🐾 Khởi động đội hình AI ở chế độ Từng Bước...`));
  const spinner = ora('Đang lập kế hoạch thỉnh kinh...').start();
  try {
    const res = await client.runSwarmStep(task);
    spinner.stop();
    console.log(formatResponse(res.text));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleSwarmNext = async () => {
  const spinner = ora('Đang thực thi bước tiếp theo...').start();
  const start = Date.now();
  try {
    const res = await client.runSwarmNext();
    spinner.stop();
    console.log(formatResponse(res.text, Date.now() - start, res.usage));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleListGroups = async () => {
  const spinner = ora('Fetching command groups...').start();
  try {
    const groups = await client.listCommandGroups();
    spinner.stop();
    console.log(chalk.cyan('\nAvailable Command Groups:'));
    groups.forEach((g) => {
      console.log(`${chalk.yellow('★')} ${chalk.bold(g.id)}: ${g.name}`);
      console.log(chalk.gray(`  └─ Steps: ${g.steps.length} | ${g.description}`));
    });
    console.log();
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleRunGroup = async (args: string) => {
  let id = args.trim();
  
  if (!id) {
    const groups = await client.listCommandGroups();
    const result = await inquirer.prompt([
      {
        type: 'list',
        name: 'groupId',
        message: 'Chọn kịch bản thực thi:',
        choices: groups.map(g => ({ name: `${g.name} (${g.description})`, value: g.id }))
      }
    ]);
    id = result.groupId;
  }
  
  const spinner = ora(`Loading command group: ${id}...`).start();
  try {
    const groups = await client.listCommandGroups();
    const group = groups.find(g => g.id === id);
    spinner.stop();

    if (!group) return console.log(chalk.red(`Error: Group '${id}' not found.`));

    console.log(chalk.cyan.bold(`\n🚀 Đang thực thi kịch bản: ${group.name}`));
    console.log(chalk.gray(`📝 ${group.description}\n`));

    for (let i = 0; i < group.steps.length; i++) {
      const stepTask = group.steps[i];
      console.log(chalk.yellow(`\n[Bước ${i + 1}/${group.steps.length}]: ${stepTask}`));
      await handleSwarm(stepTask);
    }

    console.log(chalk.green.bold('\n✅ Đã hoàn thành toàn bộ kịch bản.\n'));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleNormalAsk = async (input: string, provider: string, model: string | undefined) => {
  const spinner = ora('Thinking...').start();
  const start = Date.now();
  try {
    const res = await client.ask(input, provider, model);
    spinner.stop();
    console.log(formatResponse(res.text, Date.now() - start, res.usage));
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message;
    spinner.fail(chalk.red(`Error: ${errorMsg}`));
  }
};

const handleCommand = async (input: string, provider: string, model: string | undefined): Promise<boolean> => {
  const cmd = input.trim();
  if (!cmd) return true;

  if (cmd === '/exit' || cmd === '/quit') return false;
  if (cmd === '/help') { printHelp(); return true; }
  if (cmd === '/providers') { await handleProviders(); return true; }

  if (cmd.startsWith('/stream ')) { await handleStream(cmd.slice(8), provider, model); return true; }
  if (cmd.startsWith('/rag ')) { await handleRag(cmd.slice(5), provider, model); return true; }
  if (cmd.startsWith('/learn ')) { await handleLearn(cmd.slice(7)); return true; }
  if (cmd.startsWith('/swarm ')) { await handleSwarm(cmd.slice(7)); return true; }
  if (cmd === '/swarm') { await handleSwarm(''); return true; }

  if (cmd.startsWith('/swarm-step ')) { await handleSwarmStep(cmd.slice(12)); return true; }
  if (cmd === '/swarm-step') { await handleSwarmStep(''); return true; }

  if (cmd === '/step') { await handleSwarmNext(); return true; }
  if (cmd === '/swarms') { await handleListSwarms(); return true; }
  if (cmd === '/groups') { await handleListGroups(); return true; }

  if (cmd.startsWith('/group ')) { await handleRunGroup(cmd.slice(7)); return true; }
  if (cmd === '/group') { await handleRunGroup(''); return true; }

  if (cmd === '/roles') { await handleSwarmRoles(); return true; }

  if (cmd.startsWith('/swarm-set ')) { await handleSwarmSet(cmd.slice(11)); return true; }
  if (cmd === '/swarm-set') { await handleSwarmSet(''); return true; }
  
  if (cmd === '/pixel') {
    await startPixelVisualizer(BASE_URL);
    printBanner();
    return true;
  }

  // Default: normal ask
  await handleNormalAsk(cmd, provider, model);
  return true;
};

// --- REPL main loop ---

export const startRepl = async () => {
  printBanner();

  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: ['ollama', 'openai'],
      default: 'ollama',
    },
  ]);

  console.log(chalk.green(`✅ Using provider: ${provider}\n`));
  
  let targetModel: string | undefined = undefined;

  if (provider === 'ollama') {
    if (!isOllamaInstalled()) {
      console.log(chalk.red(`\n❌ Ollama chưa được cài đặt trên hệ điều hành (${checkOS()}).`));
      console.log(chalk.yellow(`Vui lòng truy cập https://ollama.com/download để cài đặt trước khi sử dụng AI offline.\n`));
      process.exit(1);
    }

    const { selectedModel } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selectedModel',
        message: 'Enter Ollama model name you want to use (e.g., qwen2.5, llama3):',
        default: 'qwen2.5',
      },
    ]);
    
    targetModel = selectedModel.trim();
    const installedModels = getInstalledModels();
    
    // Auto pull chat model
    if (!installedModels.includes(targetModel!)) {
      console.log(chalk.yellow(`\n⚠️ Model '${targetModel}' chưa được tải trên máy.`));
      try {
        await pullModel(targetModel!);
        console.log(chalk.green(`✅ Đã tải model '${targetModel}' thành công!\n`));
      } catch (err: any) {
        console.log(chalk.red(`\n❌ ${err.message}`));
        process.exit(1);
      }
    } else {
      console.log(chalk.green(`✅ Model '${targetModel}' đã sẵn sàng!`));
    }

    // Auto pull embed model cho RAG setup (ẩn, không hỏi User)
    const EMBED_MODEL = 'nomic-embed-text';
    if (!installedModels.includes(EMBED_MODEL)) {
      console.log(chalk.yellow(`\n⚠️ Thiếu model mã hoá vector '${EMBED_MODEL}' cho RAG. Đang tiến hành tự động tải...`));
      try {
        await pullModel(EMBED_MODEL);
        console.log(chalk.green(`✅ Đã chuẩn bị xong RAG Engine!\n`));
      } catch (err: any) {
        console.log(chalk.red(`\n❌ Lỗi tải Embeddings RAG: ${err.message} (Chức năng /rag sẽ không hoạt động được)`));
      }
    }
  }

  printHelp();

  let activeModel = targetModel || provider;
  
  const updatePrompt = (modelName: string) => {
    return chalk.bgCyan.black(` 🧠 ${modelName} `) + chalk.cyan(' ❯ ');
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: updatePrompt(activeModel),
    completer: (line: string) => {
      const completions = [
        '/ask', '/stream', '/rag', '/learn', '/providers', '/model',
        '/swarm', '/swarm-step', '/step', '/swarms', '/swarm-set',
        '/roles', '/groups', '/group', '/help', '/exit', '/quit'
      ];
      const hits = completions.filter((c) => c.startsWith(line.trim()));
      return [hits.length ? hits : completions, line];
    },
  });

  rl.prompt();

  rl.on('line', async (line) => {
    rl.pause();
    
    const cmd = line.trim();
    if (cmd.startsWith('/model')) {
      let newModel = '';
      if (cmd.startsWith('/model ')) {
        newModel = cmd.slice(7).trim();
      }
      
      if (!newModel) {
        // Chế độ tương tác: lấy danh sách model đã cài đặt
        const installedModels = getInstalledModels();
        if (installedModels.length === 0) {
          console.log(chalk.yellow('⚠️  Không tìm thấy model Ollama nào đã cài đặt.\n'));
        } else {
          const result = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedModel',
              message: 'Chọn Model Ollama:',
              choices: [...installedModels, new inquirer.Separator(), 'Nhập tên khác...']
            }
          ]);
          
          if (result.selectedModel === 'Nhập tên khác...') {
            const extra = await inquirer.prompt([{ type: 'input', name: 'name', message: 'Tên model mới:' }]);
            newModel = extra.name;
          } else {
            newModel = result.selectedModel;
          }
        }
      }

      if (newModel) {
        targetModel = newModel;
        activeModel = newModel;
        rl.setPrompt(updatePrompt(activeModel));
        console.log(chalk.green(`✅ Đã chuyển model sang: ${activeModel}\n`));
      }

      rl.resume();
      rl.prompt();
      return;
    }

    const shouldContinue = await handleCommand(line, provider, targetModel);
    if (!shouldContinue) {
      console.log(chalk.yellow('\nGoodbye! 👋\n'));
      rl.close();
      process.exit(0);
    }
    rl.resume();
    rl.prompt();
  });

  rl.on('close', () => process.exit(0));
};
