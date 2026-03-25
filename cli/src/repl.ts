import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import readline from 'readline';
import { createApiClient } from './api-client';

const BASE_URL = process.env.AI_BASE_URL || 'http://localhost:3000';
const client = createApiClient(BASE_URL);

// --- Pure helper functions ---

const printBanner = () => {
  console.log(chalk.cyan.bold('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║     🤖  AI Research CLI           ║'));
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
  console.log(chalk.white('  /help              ') + chalk.gray('— Show this help'));
  console.log(chalk.white('  /exit              ') + chalk.gray('— Quit\n'));
};

const formatResponse = (text: string) =>
  chalk.green('\n🤖 AI: ') + chalk.white(text) + '\n';

const streamResponse = (prompt: string, provider: string): Promise<void> =>
  new Promise((resolve, reject) => {
    process.stdout.write(chalk.green('\n🤖 AI: '));
    client.streamAsk(
      prompt,
      provider,
      (chunk) => process.stdout.write(chalk.white(chunk)),
      () => {
        process.stdout.write('\n\n');
        resolve();
      },
      (err) => {
        console.error(chalk.red(`\n❌ Stream error: ${err}`));
        reject(err);
      },
    );
  });

// --- Command handlers (pure functions) ---

const handleStream = async (args: string, provider: string) => {
  const prompt = args.trim();
  if (!prompt) return console.log(chalk.yellow('Usage: /stream <message>'));
  await streamResponse(prompt, provider);
};

const handleRag = async (args: string, provider: string) => {
  const prompt = args.trim();
  if (!prompt) return console.log(chalk.yellow('Usage: /rag <message>'));
  const spinner = ora('Searching knowledge base...').start();
  try {
    const res = await client.askWithContext(prompt, provider);
    spinner.stop();
    console.log(formatResponse(res.text));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleLearn = async (args: string) => {
  const text = args.trim();
  if (!text) return console.log(chalk.yellow('Usage: /learn <text>'));
  const spinner = ora('Adding to knowledge base...').start();
  try {
    await client.learn(text);
    spinner.succeed(chalk.green('Knowledge saved!'));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
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
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleNormalAsk = async (input: string, provider: string) => {
  const spinner = ora('Thinking...').start();
  try {
    const res = await client.ask(input, provider);
    spinner.stop();
    console.log(formatResponse(res.text));
  } catch (e: any) {
    spinner.fail(chalk.red(`Error: ${e.message}`));
  }
};

const handleCommand = async (input: string, provider: string): Promise<boolean> => {
  const cmd = input.trim();
  if (!cmd) return true;

  if (cmd === '/exit' || cmd === '/quit') return false;
  if (cmd === '/help') { printHelp(); return true; }
  if (cmd === '/providers') { await handleProviders(); return true; }

  if (cmd.startsWith('/stream ')) { await handleStream(cmd.slice(8), provider); return true; }
  if (cmd.startsWith('/rag ')) { await handleRag(cmd.slice(5), provider); return true; }
  if (cmd.startsWith('/learn ')) { await handleLearn(cmd.slice(7)); return true; }

  // Default: normal ask
  await handleNormalAsk(cmd, provider);
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
  printHelp();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('You › '),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    rl.pause();
    const shouldContinue = await handleCommand(line, provider);
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
