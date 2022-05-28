import { createLogger, format, transports } from 'winston';
const { timestamp, prettyPrint, json } = format;

// const stop = process.env.STOP_LOGGING?.trim();
// TODO: make this in the environment variables
const stop = true;
// console.log(stop);

const logger = createLogger({
  format: format.combine(
    prettyPrint(),
    json()
  ),
  transports: [
  new transports.Console(),
  new transports.File({
      filename: 'game-logs.log'
    })]
});

export default function log(message: string | any, type: any = 'log') {
  if (!stop) {
    switch (type) {
      case 'log':
        console.log(message);
        break;
      case 'table':
        console.table(message);
        break;
      default:
        console.log(message);
        break;
    }
    // logger.log({
    //   level: 'info',
    //   message: message
    // })
  }
}
