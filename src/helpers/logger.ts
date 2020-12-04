// const stop = process.env.STOP_LOGGING?.trim();
// TODO: make this in the environment variables
const stop = false;
// console.log(stop);

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
  }
}
