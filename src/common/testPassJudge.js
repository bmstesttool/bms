class TestPassJudge {
  messageArray = [];

  // 当前测试条目的索引
  currentTestIndex;

  currentTime;

  constructor(currentTestIndex) {
    this.currentTestIndex = currentTestIndex;
  }

  setCurrentTestIndex = (currentTestIndex) => {
    this.currentTestIndex = currentTestIndex;
  }

  setCurrentTestProgramID = (currentTestProgramID) => {
    this.currentTestProgramID = currentTestProgramID;
  }

  addMessage = (currentTestIndex, message) => {
    if (currentTestIndex !== this.currentTestIndex) {
      return false;
    }
    this.messageArray.push(message);
    return true;
  }

  passJudge = (currentTestProgramID) => {
    switch (currentTestProgramID) {
      case 1: // DP1001
        return this.dp1001Judge();
      default:
        break;
    }
    return false;
  }

  dp1001Judge = () => {
    // 5s内没有收到CHM报文
    if (this.messageArray === []) {
      return false;
    }
    // 报文正确性判断
    const errorPrecision = 250 * 0.1;
    if (this.messageArray[0].id === 0x1826F456) {
      this.currentTime = this.messageArray[0].timeStamp;
    } else {
      return false;
    }
    for (let i = 1; i < this.messageArray.length; i += 1) {
      // 报文正确性判断
      if (this.messageArray[i].id === 0x1826F456) {
        if (Math.abs(this.messageArray[i].timeStamp - this.currentTime) < errorPrecision) {
          // 报文周期正确性判断
          this.currentTime = this.messageArray[i].timeStamp;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }
}

export default TestPassJudge;
