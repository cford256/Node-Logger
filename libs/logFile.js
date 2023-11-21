/**
 * LogFile.js
 *
 * A simple node.js file to group and color message logs, with the ablity to
 * save the logs to text file.
 *
 * @author https://github.com/cford256
 */

const fs = require('fs');
const path = require('path');

class LogFile {
  /**
   * @param prefix
   * @example config {
   * .    enabled: "If the logger logs to the console. Also won't log to the log file if disabled.",
   * .    useTimestamp: "If the time should also be logged.",
   * .    logFile: "If the message is also logged to the log file",
   * .    logDir: "The place where the log file is saved. Defaults to '../logs'",
   * .    prefixColor: "The color of the prefix.",
   * .    color: "The color of the logged objects.",
   * .    timeColor: "The color of the timestamp in the logs.",
   * .    emoji: "The emoji that is displayed in each message. 📘"
   * }
   */
  constructor(prefix, config) {
    this.startTime = new Date();
    this.text = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      underscore: '\x1b[4m',
      blink: '\x1b[5m',
      reverse: '\x1b[7m',
      hidden: '\x1b[8m',
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgBlack: '\x1b[40m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      gbYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m',
      bgWhite: '\x1b[47m',
    };

    this.prefix = prefix ?? '';
    this.enabled = config?.enabled ?? true;
    this.setPrefixColor(config?.prefixColor ?? 'blue');
    this.setLogColor(config?.color ?? '');
    this.setTimestampColor(config?.timeColor ?? 'green');
    this.emoji = config?.emoji ?? '🔵 ';
    this.useTimestamp = config?.useTimestamp ?? true;
    this.logFile = config?.logFile ?? false;
    this.logDir = config?.logDir ?? path.join(__dirname, '..', 'logs');
    this.logPath = null;
    if (this.logFile) this.enableLogFile();
  }

  /**
   * Log a stylized message to the console, prepended with the prefix
   */
  log() {
    if (this.enabled) {
      let args = Array.prototype.slice.call(arguments);
      this.logToFile(this.emoji, args);
      args.unshift(this.getPrefix(this.emoji) + this.logColor);
      args.push(this.text.reset);
      console.log.apply(console, args);
    }
  }

  /**
   * Log a stylized warining message to the console, prepended with the prefix
   */
  warn() {
    if (this.enabled) {
      const args = Array.prototype.slice.call(arguments);
      const emoji = '🟡';
      this.logToFile(emoji, ...args);
      args.unshift(this.getPrefix(emoji) + this.text.yellow);
      args.push(this.text.reset);
      console.warn.apply(console, args);
    }
  }

  /**
   * Log a stylized error message to the console, prepended with the prefix
   */
  error() {
    if (this.enabled) {
      const args = Array.prototype.slice.call(arguments);
      const emoji = '🟥';
      this.logToFile(emoji, ...args);
      args.unshift(this.getPrefix(emoji) + this.text.red);
      args.push(this.text.reset);
      console.error.apply(console, args);
    }
  }

  getPrefix(emoji = '') {
    let prefix = '';
    if (emoji) emoji = ` ${emoji} `;
    let time = this.useTimestamp ? `${this.timeColor}${this.getTime()} ` : '';
    prefix += this.text.underscore + this.text.bright + this.prefixColor;
    if (this.prefix) prefix += `[${this.prefix}]`;
    return this.text.reset + time + emoji + prefix + this.text.reset + ' ';
  }

  /**
   * @param color Set what color the prfix is shown as in the console.
   */
  setPrefixColor(color) {
    this.prefixColor = color ? this.text[color] : '';
  }

  /**
   * @param color Set what color the log text is shown as in the console.
   */
  setLogColor(color) {
    this.logColor = color ? this.text[color] : '';
  }

  /**
   * @param color Set what color the timestamp is shown as in the console.
   */
  setTimestampColor(color) {
    this.timeColor = color ? this.text[color] : '';
  }

  /**
   * @param logName take in a name to call the log file, and enables loging to a file.
   */
  enableLogFile(logName = this.prefix) {
    this.logFile = true; // Maybe should have a way to disable the log other than directly accessing the property.
    if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
    const dateParts = new Date().toLocaleDateString().split('/');
    const today = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
    this.logPath = path.join(this.logDir, `${logName}_${today}.log`);
  }

  /**
   * Logs the given aruments to the logfile. Can be used to write to the logfile and not the console.
   */
  logToFile() {
    if (this.enabled && this.logFile) {
      const args = Array.prototype.slice.call(arguments);
      const emoji = args.shift().trim();
      args.forEach((arg, i) => {
        if (typeof arg === 'string') {
          args[i] = arg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        }
      });

      const timestamp = this.getTime();
      const prefix = this.prefix ? `[${this.prefix}]` : '';
      fs.appendFileSync(this.logPath, `${timestamp} ${emoji} ${prefix} ${args} \r\n`);
    }
  }

  /**
   * @returns A timestamp for the current moment.
   */
  getTime() {
    return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(11, 19);
  }

  /**
   * @returns A clone of the Logger object, that can be changed sepratly from the original one.
   */
  clone() {
    return (this.logger = Object.assign(Object.create(Object.getPrototypeOf(this)), this));
  }

  /**
   * @returns A formated string showing the the time elapsed since the logger was created.
   */
  elapsedTime() {
    const endTime = new Date();
    let timeDiff = Math.round((endTime - this.startTime) / 1000);
    const d = Math.floor(timeDiff / 60 / 60 / 24) | 0;
    const days = d >= 1 ? `${d} Days ` : '';
    timeDiff -= d * 60 * 60 * 24;
    const h = Math.floor(timeDiff / 60 / 60) | 0;
    const hours = h >= 1 ? `${h} Hours ` : '';
    timeDiff -= h * 60 * 60;
    const m = Math.floor(timeDiff / 60) | 0;
    const mins = m >= 1 ? `${m} Minites  ` : '';
    timeDiff -= m * 60;
    const sec = (h === 0 && m === 0) || timeDiff >= 1 ? `${timeDiff} Seconds` : '';
    let time = `\n\t  Start Time:   ${this.startTime.toLocaleString()}`;
    time += `\n\t    End Time:   ${endTime.toLocaleString()}`;
    time += `\n\tTime Elapsed:   ${days}${hours}${mins}${sec}`;
    return time;
  }
}
module.exports = LogFile;
