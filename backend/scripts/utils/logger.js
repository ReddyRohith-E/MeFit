/**
 * Enhanced logging utility with performance tracking
 * Extracted from seed.js to reduce file size and improve maintainability
 */

const options = {
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  quiet: process.argv.includes('--quiet') || process.argv.includes('-q'),
  silent: process.argv.includes('--silent')
};

const log = {
  info: (msg) => { 
    if (!options.quiet && !options.silent) {
      console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    }
  },
  success: (msg) => {
    if (!options.silent) {
      console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    }
  },
  warning: (msg) => {
    if (!options.quiet && !options.silent) {
      console.log(`\x1b[33m[WARNING]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    }
  },
  error: (msg) => {
    if (!options.silent) {
      console.log(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    }
  },
  debug: (msg) => {
    if (options.verbose && !options.silent) {
      console.log(`\x1b[90m[DEBUG]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    }
  },
  header: (msg) => {
    if (!options.silent) {
      console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`);
    }
  },
  progress: (current, total, item = '') => {
    if (options.quiet || options.silent) return;
    
    const percentage = ((current / total) * 100).toFixed(1);
    const filled = Math.floor((current / total) * 30);
    const empty = 30 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    process.stdout.write(`\r\x1b[36m[${bar}]\x1b[0m ${percentage}% (${current}/${total}) ${item}`);
    if (current === total) console.log(); // New line when complete
  },
  memory: () => {
    if (!options.verbose || options.silent) return;
    
    const used = process.memoryUsage();
    const usage = Object.entries(used).map(([key, value]) => 
      `${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`
    ).join(', ');
    
    console.log(`\x1b[90m[MEMORY]\x1b[0m ${usage}`);
  }
};

function trackMemoryUsage() {
  const current = process.memoryUsage();
  const initialMemory = trackMemoryUsage.initial || current;
  trackMemoryUsage.initial = trackMemoryUsage.initial || current;
  
  return {
    current: Math.round(current.heapUsed / 1024 / 1024 * 100) / 100,
    peak: Math.round(current.heapTotal / 1024 / 1024 * 100) / 100,
    delta: Math.round((current.heapUsed - initialMemory.heapUsed) / 1024 / 1024 * 100) / 100
  };
}

function measureOperation(operationName, operation) {
  return async function(...args) {
    const startTime = Date.now();
    const startMemory = trackMemoryUsage();
    
    try {
      const result = await operation.apply(this, args);
      const duration = Date.now() - startTime;
      const endMemory = trackMemoryUsage();
      
      log.debug(`${operationName} completed in ${duration}ms (Memory: ${endMemory.current}MB)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const endMemory = trackMemoryUsage();
      
      log.error(`${operationName} failed after ${duration}ms (Memory: ${endMemory.current}MB): ${error.message}`);
      throw error;
    }
  };
}

module.exports = {
  log,
  trackMemoryUsage,
  measureOperation,
  options
};
