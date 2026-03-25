import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import readline from 'readline';
import { createApiClient } from './api-client';
import { checkOS, isOllamaInstalled, getInstalledModels, pullModel } from './utils/ollama-setup';

const BASE_URL = process.env.AI_BASE_URL || 'http://localhost:3000';
const client = createApiClient(BASE_URL);

// --- Pure helper functions ---

const printBanner = () => {
  console.log(chalk.cyan.bold('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║     🤖  AI Research CLI          ║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════╝'));
  console.log(chalk.gray(`  Backend: ${BASE_URL}`));
  console.log(chalk.gray('  Commands: /stream, /rag, /learn, /providers, /exit\n'));
};

const printHelp = () => {
  console.log(chalk.yellow('\nAvailable commands:'));
  console.log(chalk.white('  /stream <message>  ') + chalk.gray('— Stream AI response via WebSocket'));
  console.log(chalk.white('  /rag <message>     ') + chalk.gray('— Ask with RAG context'));
  console.log(chalk.white('  /learn <text>      ') + chalk.gray('— Teach AI new knowledge'));
  console.log(chalk.white('  /providers         ') + chalk.gray('— List available AI providers'));
  console.log(chalk.white('  /model <name>      ') + chalk.gray('— Switch AI model dynamically'));
  console.log(chalk.white('  /help              ') + chalk.gray('— Show this help'));
  console.log(chalk.white('  /exit              ') + chalk.gray('— Quit\n'));
};

const formatResponse = (text: string, timeMs?: number) => {
  const timeStr = timeMs ? chalk.gray(`  [⏱️ ${(timeMs / 1000).toFixed(2)}s]`) : '';
  return chalk.green('\n🤖 AI: ') + chalk.white(text) + timeStr + '\n';
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
    console.log(formatResponse(res.text, Date.now() - start));
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

const handleNormalAsk = async (input: string, provider: string, model: string | undefined) => {
  const spinner = ora('Thinking...').start();
  const start = Date.now();
  try {
    const res = await client.ask(input, provider, model);
    spinner.stop();
    console.log(formatResponse(res.text, Date.now() - start));
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
  
  if (cmd.startsWith('/model ')) { 
    // Handled in rl.on('line') to access rl context and update prompt
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
  });

  rl.prompt();

  rl.on('line', async (line) => {
    rl.pause();
    
    const cmd = line.trim();
    if (cmd.startsWith('/model ')) {
      const newModel = cmd.slice(7).trim();
      if (newModel) {
        targetModel = newModel;
        activeModel = newModel;
        rl.setPrompt(updatePrompt(activeModel));
        console.log(chalk.green(`✅ Đã chuyển model sang: ${activeModel}\n`));
      } else {
        console.log(chalk.yellow('Usage: /model <model_name>\n'));
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
