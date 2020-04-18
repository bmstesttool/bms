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

  // 所属测试例编号
  testCaseID;

  // 所属测试例名称
  testCaseName;

  // 测试编号
  testID;

  // 报文标签
  messageLabel;

  // 错误标识
  errorFlag;

  // 错误信息
  errorContent;

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
