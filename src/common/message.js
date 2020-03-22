import moment from 'moment';

class Message {
  // 标识
  code;

  // 收发标志
  flag;

  // 时间
  time;

  // 时间戳
  timestamp;

  // 帧ID
  id;

  // 数据长度
  dataLength;

  // 数据
  data;

  // 数据转码
  dataStr;

  // 翻译报文
  text;

  constructor(code) {
    const date = new Date();
    this.time = moment(date).format('YYYY-MM-DD HH:mm:ss.SSS');
    this.timestamp = date.valueOf();
    this.code = code.code;
    this.id = code.id;
    this.dataLength = code.dataLength;
  }
}

export default Message;
