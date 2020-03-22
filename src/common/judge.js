import TestCase from './testCase';
import PGN from './pgn';

class Judge {
  // 消息队列
  messageList;

  firstMessageTimestamp;

  lastMessage;

  // 判断结果 0-失败 1-成功 2-进行中
  result;

  constructor() {
    this.messageList = [];
    this.firstMessageTimestamp = 0;
    this.lastMessage = null;
    this.result = 0;
  }

  reset = () => {
    this.messageList = [];
    this.firstMessageTimestamp = 0;
    this.lastMessage = null;
  }

  judge = (message, testCase) => {
    switch (testCase.id) {
      case TestCase.DP1001.id:
        if (message.id === PGN.CHM.id) {
          if (message.data[0] === 0x00 && message.data[1] === 0x01 && message.data[2] === 0x01) {
            const now = new Date();
            if (this.lastMessage === null) {
              this.firstMessageTimestamp = now.valueOf();
              this.result = 2;
              this.lastMessage = message;
            } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
              if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 50) {
                this.result = 1;
                this.reset();
              } else {
                this.result = 0;
                this.reset();
              }
            } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 50) {
              this.result = 2;
              this.lastMessage = message;
            } else {
              this.result = 0;
              this.reset();
            }
          } else {
            this.result = 0;
            this.reset();
          }
        } else {
          this.result = 0;
          this.reset();
        }
        break;

      case TestCase.DP1002.id:
        // if (message.id === PGN.CRM.id)
        break;

      default:
        break;
    }
    return this.result;
  }
}

export default Judge;
