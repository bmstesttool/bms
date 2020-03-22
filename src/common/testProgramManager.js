class TestProgramManager {
  // 测试程序集合
  testPrograms = [];

  // 当前测试程序
  currentTestProgram = {};

  // 当前测试程序index
  currentTestProgramIndex = 0;

  // 当前测试程序的ID
  currentTestProgramID = 0;

  // 当前测试进度
  testSchedule = 0;

  // 当前测试总耗时
  testTotalTime = 0;

  // 测试完成标志
  testFinishedFlag = false;

  constructor(testPrograms) {
    this.testPrograms = testPrograms;
    this.currentTestProgram = this.testPrograms[0];
    this.currentTestProgramIndex = this.testPrograms[0].index;
    this.currentTestProgramID = this.testPrograms[0].id;
    this.testSchedule = 0;
    this.testTotalTime = 0;
  }

  setCurrentTestProgramIndex = (currentTestProgramIndex) => {
    this.currentTestProgramIndex = currentTestProgramIndex;
  }

  setCurrentTestProgramIndexToNext = (currentTestProgramIndex) => {
    for (let i = 0; i < this.testPrograms.length; i += 1) {
      if (currentTestProgramIndex === this.testPrograms[i].id) {
        // 当当前测试条目为最后一个条目时
        if (this.testPrograms.length - 1 === i) {
          return true;
        }
        if (this.testPrograms.length - 1 !== i) {
          this.currentTestProgramIndex = this.testPrograms[i + 1].index;
          this.currentTestProgramID = this.testPrograms[i + 1].id;
          this.currentTestProgram = this.testPrograms[i + 1];
          return false;
        }
      }
    }
    return true;
  }

  getCurrentTestProgramIndex = () => {
    return this.currentTestProgramIndex;
  }

  setCurrentTestProgramID = (currentTestProgramID) => {
    this.currentTestProgramID = currentTestProgramID;
  }

  getCurrentTestProgramID = () => {
    return this.currentTestProgramID;
  }

  setProgramTestStatusByIndex = (index, testStatus) => {
    if (index < this.testPrograms.length - 1) {
      this.testPrograms[index].testStatus = testStatus;
    }
  }

  // 获取指定index的测试条目的测试状态
  getProgramTestStatusByIndex = (index) => {
    if (index < this.testPrograms.length - 1) {
      return this.testPrograms[index].testStatus;
    }
    return '索引错误';
  }

  setProgramTestResultByIndex = (index, testResult) => {
    if (index < this.testPrograms.length - 1) {
      this.testPrograms[index].testResult = testResult;
    }
  }

  // 获取指定index的测试条目的测试结果
  getProgramTestResultByIndex = (index) => {
    if (index < this.testPrograms.length - 1) {
      return this.testPrograms[index].testResult;
    }
    return '索引错误';
  }

  setTestFinishedFlag = (testFinishedFlag) => {
    this.testFinishedFlag = testFinishedFlag;
  }

  getTestFinishedFlag = () => {
    return this.testFinishedFlag;
  }
}

export default TestProgramManager;
