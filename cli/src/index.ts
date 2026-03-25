#!/usr/bin/env node
import { startRepl } from './repl';

startRepl().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
