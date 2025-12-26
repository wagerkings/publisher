#!/usr/bin/env node

import { processCommand } from './commands/process.js';
import { watchCommand } from './commands/watch.js';
import { statusCommand } from './commands/status.js';

const command = process.argv[2];

switch (command) {
  case 'watch':
    watchCommand(process.argv.slice(3)).catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
    break;

  case 'process':
    processCommand(process.argv.slice(3)).catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
    break;

  case 'status':
    statusCommand(process.argv.slice(3)).catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
    break;

  default:
    console.error(`Unknown command: ${command || '(none)'}`);
    console.error('Usage: agent <watch|process|status> [options]');
    process.exit(1);
}

