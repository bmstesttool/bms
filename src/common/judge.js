import TestCase from './testCase';
import PGN from './pgn';

const ERROR = 0;
const SUCCESS = 1;
const ONGOING = 2;
class Judge {
  // 消息队列
  messageList;

  firstMessageTimestamp;

  lastMessage;

  lastMessage2;

  lastTestCase;

  // 判断结果 0-失败 1-成功 2-进行中
  result;

  judgeCase;

  constructor() {
    this.messageList = [];
    this.firstMessageTimestamp = 0;
    this.lastMessage = null;
    this.lastMessage2 = null;
    this.lastTestCase = null;
    this.result = ERROR;
    this.judgeCase = {
      [TestCase.DP1001.id]: this.judgeDP1001,
      [TestCase.DP1002.id]: this.judgeDP1002,
      [TestCase.DP1003.id]: this.judgeDP1003,
      [TestCase.DN1001.id]: this.judgeDN1001,
      [TestCase.DN1002.id]: this.judgeDN1001,
      [TestCase.DN1003.id]: this.judgeDN1001,
      [TestCase.DN1004.id]: this.judgeDN1004,
      [TestCase.DP2001.id]: this.judgeDP2001,
      [TestCase.DP2002.id]: this.judgeDP2002,
      [TestCase.DP2003.id]: this.judgeDP2003,
      [TestCase.DN2001.id]: this.judgeDN2001,
      [TestCase.DN2002.id]: this.judgeDN2001,
      [TestCase.DN2003.id]: this.judgeDN2003,
      [TestCase.DN2004.id]: this.judgeDN2003,
      [TestCase.DN2005.id]: this.judgeDN2005,
      [TestCase.DN2006.id]: this.judgeDN2003,
      [TestCase.DN2007.id]: this.judgeDN2007,
      [TestCase.DN2008.id]: this.judgeDN2007,
      // [TestCase.DN2009.id]: this.judgeDN2009, // DN2009不接受报文，切换测试项是直接判断
      [TestCase.DN2010.id]: this.judgeDN2010,
      [TestCase.DP3001.id]: this.judgeDP3001,
      [TestCase.DP3002.id]: this.judgeDP3001,
      [TestCase.DP3003.id]: this.judgeDP3003,
      [TestCase.DP3004.id]: this.judgeDP3001,
      [TestCase.DP3005.id]: this.judgeDP3005,
      [TestCase.DP3006.id]: this.judgeDP3006,
      [TestCase.DP3007.id]: this.judgeDP3007,
      [TestCase.DN3001.id]: this.judgeDN3001,
      [TestCase.DN3002.id]: this.judgeDN3002,
      [TestCase.DN3003.id]: this.judgeDN3003,
      [TestCase.DN3004.id]: this.judgeDN3002,
      [TestCase.DN3005.id]: this.judgeDN3005,
      [TestCase.DN3006.id]: this.judgeDN3006,
      [TestCase.DN3007.id]: this.judgeDN3005,
      [TestCase.DN3008.id]: this.judgeDN3006,
      [TestCase.DN3009.id]: this.judgeDN3009,
      [TestCase.DN3010.id]: this.judgeDN3009,
      [TestCase.DP4001.id]: this.judgeDP4001,
      // [TestCase.DP4002.id]: this.judgeDP4002, // DP4002不接受报文，暂时不处理
      [TestCase.DN4001.id]: this.judgeDN4001,
      [TestCase.DN4002.id]: this.judgeDN4002,
      [TestCase.DN4003.id]: this.judgeDN4001,
      [TestCase.DN4004.id]: this.judgeDN4001,

    };
  }

  reset = () => {
    this.messageList = [];
    this.firstMessageTimestamp = 0;
    this.lastMessage = null;
    this.lastMessage2 = null;
  }

  judgeInterval = (message, interval, duration) => {
    const now = new Date();
    if (this.lastMessage === null) {
      this.firstMessageTimestamp = now.valueOf();
      this.result = ONGOING;
      this.lastMessage = message;
    } else if (now.valueOf() - this.firstMessageTimestamp >= duration) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - interval) < interval * 0.1) {
        this.result = SUCCESS;
        this.reset();
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - interval) < interval * 0.1) {
      this.result = ONGOING;
      this.lastMessage = message;
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP1001 = (message) => {
    if (message.id === PGN.CHM.id) {
      if (message.data[0] === 0x00 && message.data[1] === 0x01 && message.data[2] === 0x01) {
        this.judgeInterval(message, 250, 5000);
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP1002 = (message) => {
    if (message.id === PGN.CHM.id) {
      if (message.data[0] === 0x00 && message.data[1] === 0x01 && message.data[2] === 0x01) {
        this.judgeInterval(message, 250, 5000);
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRM.id) {
      if (message.data[0] === 0x00) {
        if (this.lastMessage === null || this.lastMessage.id === PGN.CHM.id) {
          this.reset();
        }
        this.judgeInterval(message, 250, 5000);
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP1003 = (message) => {
    if (message.id === PGN.CRM.id) {
      if (message.data[0] === 0xAA) {
        this.judgeInterval(message, 250, 5000);
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN1001 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRM.id && message.data[0] === 0x00) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[0] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[0] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRM.id && message.data[0] === 0x00) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN1004 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRM.id && message.data[0] === 0xAA) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[1] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[1] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRM.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP2001 = (message) => {
    const now = new Date();
    if (message.id === PGN.CRM.id) {
      if (this.lastMessage === null) {
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CML.id) {
      if (this.lastMessage === null) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CTS.id) {
      if (this.lastMessage2 === null || (Math.abs(message.timestamp - this.lastMessage2.timestamp - 500) < 500 * 0.1)) {
        this.lastMessage2 = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP2002 = (message) => {
    const now = new Date();
    if (message.id === PGN.CML.id) {
      if (this.lastMessage === null) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CTS.id) {
      if (this.lastMessage2 === null || (Math.abs(message.timestamp - this.lastMessage2.timestamp - 500) < 500 * 0.1)) {
        this.lastMessage2 = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP2003 = (message) => {
    const now = new Date();
    if (message.id === PGN.CML.id || message.id === PGN.CTS.id) {
      if (this.lastMessage === null) {
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id) {
      if (message.data[0] === 0x00) {
        if (this.lastMessage === null) {
          this.lastMessage = message;
          this.firstMessageTimestamp = now.valueOf();
          this.result = ONGOING;
        } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
          this.result = ERROR;
          this.reset();
        } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.lastMessage = message;
          this.result = ONGOING;
        }
      } else if (message.data[0] === 0xAA) {
        if (this.lastMessage.data[0] === 0x00) {
          this.lastMessage = message;
          this.firstMessageTimestamp = now.valueOf();
          this.result = ONGOING;
        } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
          if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
            this.result = SUCCESS;
            this.reset();
          } else {
            this.result = ERROR;
            this.reset();
          }
        } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.lastMessage = message;
          this.result = ONGOING;
        } else {
          this.result = ERROR;
          this.reset();
        }
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN2001 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRM.id && message.data[0] === 0xAA) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[1] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[1] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRM.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN2003 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CML.id) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else if (message.id === PGN.CTS.id) {
        this.lastMessage2 = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CML.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CTS.id) {
      if (Math.abs(message.timestamp - this.lastMessage2.timestamp - 500) < 500 * 0.1) {
        this.result = ONGOING;
        this.lastMessage2 = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN2005 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CML.id) {
        this.firstMessageTimestamp = now.valueOf();
        this.lastMessage = message;
        this.result = ONGOING;
      } else if (message.id === PGN.CTS.id) {
        this.lastMessage2 = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 65000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (now.valueOf() - this.firstMessageTimestamp >= 60000) {
        if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
          this.result = ONGOING;
          this.lastMessage = message;
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (message.id === PGN.CML.id) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = ONGOING;
          this.lastMessage = message;
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (message.id === PGN.CTS.id) {
        if (Math.abs(message.timestamp - this.lastMessage2.timestamp - 500) < 500 * 0.1) {
          this.result = ONGOING;
          this.lastMessage2 = message;
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    }
  }

  judgeDN2007 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRO.id && message.data[0] === 0x00) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id && message.data[0] === 0x00) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN2010 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 6000) {
      if (message.id === PGN.CEM.id && (message.data[1] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 1000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x0C) >> 2 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP3001 = (message) => {
    const now = new Date();
    if (message.id === PGN.CRO.id) {
      if (this.lastMessage === null && message.data[0] === 0xAA) {
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CCS.id) {
      if (this.lastMessage === null) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
        this.lastMessage = message;
        this.result = ONGOING;
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP3003 = (message) => {
    const now = new Date();
    if (message.id === PGN.CCS.id) {
      if (this.lastMessage === null) {
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CST.id) {
      if (this.lastMessage === null) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.lastMessage = message;
        this.result = ONGOING;
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP3005 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CCS.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10 * 60 * 1000 + 5000) {
      if (message.id === PGN.CTS.id) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10 * 60 * 1000) {
      if (message.id === PGN.CTS.id) {
        if (this.lastMessage.id === PGN.CCS.id) {
          this.lastMessage = message;
          this.result = ONGOING;
        } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.lastMessage = message;
          this.result = ONGOING;
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP3006 = (message) => {
    const now = new Date();
    if (message.id === PGN.CCS.id) {
      if (this.lastMessage === null) {
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CTS.id) {
      if (this.lastMessage === null) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP3007 = (message) => {
    const now = new Date();
    if (message.id === PGN.CTS.id) {
      if (this.lastMessage === null) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3001 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3002 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 6000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 1000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x0C) >> 2 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3003 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CRO.id && message.data[0] === 0xAA) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 250) < 250 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3005 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CCS.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[2] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CCS.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3006 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CCS.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 6000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x0C) >> 2 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 1000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x0C) >> 2 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CCS.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 50) < 50 * 0.1) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN3009 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CST.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x30) >> 4 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && (message.data[2] & 0x30) >> 4 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CST.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDP4001 = (message) => {
    if (message.id === PGN.CSD.id) {
      const now = new Date();
      if (this.lastMessage === null) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else if (now.valueOf() - this.firstMessageTimestamp - 250 < 250 * 0.1) {
        this.lastMessage = message;
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN4001 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CST.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 15000) {
      if (message.id === PGN.CEM.id && message.data[3] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[3] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CST.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judgeDN4002 = (message) => {
    const now = new Date();
    if (this.lastMessage === null) {
      if (message.id === PGN.CST.id) {
        this.lastMessage = message;
        this.firstMessageTimestamp = now.valueOf();
        this.result = ONGOING;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 10000) {
      if (message.id === PGN.CEM.id && message.data[3] & 0x03 === 0x01) {
        if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
          this.result = SUCCESS;
          this.reset();
        } else {
          this.result = ERROR;
          this.reset();
        }
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (now.valueOf() - this.firstMessageTimestamp >= 5000) {
      if (message.id === PGN.CEM.id && message.data[3] & 0x03 === 0x01) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else if (message.id === PGN.CST.id) {
      if (Math.abs(message.timestamp - this.lastMessage.timestamp - 10) < 5) {
        this.result = ONGOING;
        this.lastMessage = message;
      } else {
        this.result = ERROR;
        this.reset();
      }
    } else {
      this.result = ERROR;
      this.reset();
    }
  }

  judge = (message, testCase) => {
    if (this.lastTestCase === null) {
      this.lastTestCase = testCase;
    } else if (testCase.index !== this.lastTestCase.index) {
      this.reset();
      this.lastTestCase = testCase;
    }
    this.judgeCase[testCase.id](message);
    return this.result;
  }
}

export default Judge;
