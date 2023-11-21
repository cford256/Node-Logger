/**
 * Example ussage of logFile.js
 *
 * @author https://github.com/cford256
 */

const path = require('path');
const LogFile = require('./libs/logFile.js');

const logger = new LogFile(path.basename(__filename), {
  logFile: true,
});

const wait = (t = 1000) => new Promise((resolve) => setTimeout(resolve, t));

const main = async () => {
  logger.log('Hello World Log');
  logger.warn('Hello World Warning');
  logger.error('Hello World Error ');

  logger.enabled = false;
  logger.log('Log Not Enabled');
  logger.enabled = true;
  logger.log('Log Enabled again');
  logger.logFile = false;
  logger.log('Not logged to file');
  logger.logFile = true;

  const logger2 = new LogFile('Prefix', {
    color: 'yellow',
    prefixColor: 'magenta',
    timeColor: 'cyan',
    emoji: '📘',
  });
  // Save to same logfile.
  logger2.enableLogFile(path.basename(__filename));

  logger2.log('Diffrent module message.');
  logger2.useTimestamp = false;
  logger2.log('Without Timestamp');
  logger2.emoji = '';
  logger2.log('Without Emoji');
  logger2.prefix = '';
  logger2.log('Without prefix');
  logger.warn('Waiting 1 second.');
  await wait(1000);
};

(async function () {
  try {
    await main();
    process.on('exit', () => onExit());
    process.exit();
  } catch (err) {
    logger.error(err);
    process.on('exit', () => onExit('🟥'));
    process.exit();
  }
})();

const onExit = (emoji = '🟢') => {
  logger.emoji = emoji;
  logger.setLogColor('green');
  logger.log(logger.elapsedTime(), `\r\n___________________________________________________________________________________________________`);
};
