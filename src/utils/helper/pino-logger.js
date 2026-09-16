const pino = require('pino');
const path = require('path');

const getLogFileName = (level) => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(process.cwd(), `logs/${level}-${date}.log`);
};

const transport = pino.transport({
  targets: [
    {
      level: 'error',
      target: 'pino/file',
      options: {
        destination: getLogFileName('error'),
        mkdir: true,
      },
    },
    {
      level: 'warn',
      target: 'pino/file',
      options: {
        destination: getLogFileName('warn'),
        mkdir: true,
      },
    },
    {
      level: 'fatal',
      target: 'pino/file',
      options: {
        destination: getLogFileName('fatal'),
        mkdir: true,
      },
    },
    {
      level: 'debug',
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  ],
});

const logger = pino(
  {
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime,
    base: null,
  },
  transport,
);

module.exports = logger;
