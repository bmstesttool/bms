import Vue from 'vue';
import moment from 'moment';
import BMSConnector from './bMSConnector';
import Translator from './translator';
import TestPassJudge from './testPassJudge';
import TestProgramManager from './testProgramManager';

class TestController {
  constructor(testPrograms, port, ip) {
    // 初始化程序管理器
    this.testProgramManager = new TestProgramManager(testPrograms);

    // 初始话bMS连接器
    this.bMSConnector = new BMSConnector(port, ip, 1);
    this.bMSConnector.server.on('close', () => {
      this.serverStatus = false;
      console.log('TCP server 已关闭');
    });
    this.bMSConnector.server.on('listening', () => {
      this.serverStatus = true;
      console.log(`正在监听${ip}:${port}`);
    });

    // 初始化translator报文翻译器
    this.translator = new Translator();

    // 初始化测试通过判断器
    if (this.testProgramManager.getCurrentTestProgramIndex() > -1) {
      this.testPassJudger = new TestPassJudge(this.testProgramManager.getCurrentTestProgramIndex());
    }
  }

  // 测试程序管理相关
  // 测试程序管理器 负责维护当前测试程序集合
  testProgramManager = null;

  // BMS连接相关
  // BMS连接器 负责与BMS建立通讯连接，及消息交互功能
  bMSConnector = null;

  serverStatus = false;

  // 报文翻译相关
  // 报文翻译器 负责翻译报文
  translator = null;

  // 测试结果判断相关
  // 测试结果判断器
  testPassJudger = null;

  // 测试判断
  currentTempPassStatus = true;

  // BMS准备就绪标识
  currentBMSReadyFlag = false;

  // 测试结束标识
  testFinishedFlag = false;

  // 测试准备状态
  testReadyFlag = false;

  // 未收到报文延时器
  cannotReceivedMessageTimer = null;

  // 第一次收到报文延时器
  firstReceivedMessageTimer = null;

  // 测试开始准备
  readyTest = () => {
    // 向BMS发送测试程序集的第一个条目,获得返回,为true,则开始，为false则提醒
    this.testReadyFlag = true;
  }

  // 开始测试
  startTest = () => {
    this.currentBMSReadyFlag = true;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS').valueOf();
    console.log(currentTime);
    // 开启监听BMS报文消息
    if (this.testReadyFlag) {
      this.bMSConnector.server.on('connection', (socket) => {
        console.log('已连接');
        const programIndex = this.testProgramManager.getCurrentTestProgramIndex();
        this.testProgramManager.setProgramTestStatusByIndex(programIndex, '正在测试');
        this.testProgramManager.setProgramTestResultByIndex(programIndex, '');
        this.cannotReceivedMessageTimer = setTimeout(() => {
          const testProgramIndex = this.testProgramManager.getCurrentTestProgramIndex();
          this.testProgramManager.setProgramTestStatusByIndex(testProgramIndex, '测试完成');
          this.testProgramManager.setProgramTestResultByIndex(testProgramIndex, '测试不通过');
          Vue.bus.emit('testSchedule', {
            index: testProgramIndex,
            testStatus: this.testProgramManager.getProgramTestStatusByIndex(testProgramIndex),
            testResult: this.testProgramManager.getProgramTestResultByIndex(testProgramIndex),
          });
          this.changeCurrentTestItem();
        }, 5000);
        console.log(this.cannotReceivedMessageTimer);
        socket.on('data', (data) => {
          console.log(data);
          // 清除定时器
          if (this.cannotReceivedMessageTimer !== null) {
            clearTimeout(this.cannotReceivedMessageTimer);
          }
          this.cannotReceivedMessageTimer = null;
          // 可能需要报文过滤
          if (this.firstReceivedMessageTimer === null) {
            this.firstReceivedMessageTimer = setTimeout(() => {
              const testProgramIndex = this.testProgramManager.getCurrentTestProgramIndex();
              this.testProgramManager.setProgramTestStatusByIndex(testProgramIndex, '测试完成');
              if (this.currentTempPassStatus) {
                this.testProgramManager.setProgramTestResultByIndex(testProgramIndex, '测试通过');
              } else {
                this.testProgramManager.setProgramTestResultByIndex(testProgramIndex, '测试不通过');
              }
              Vue.bus.emit('testSchedule', {
                index: testProgramIndex,
                testStatus: this.testProgramManager.getProgramTestStatusByIndex(testProgramIndex),
                testResult: this.testProgramManager.getProgramTestResultByIndex(testProgramIndex),
              });
              this.changeCurrentTestItem();
              this.firstReceivedMessageTimer = null;
            }, 5000); // 测试时长和测试项目匹配
            console.log(this.firstReceivedMessageTimer);
          }
          if (this.currentTempPassStatus === true) {
            const message = this.translator.translate(data);
            // 向前端发送测试进度消息,只发送更新消息
            const testProgramIndex = this.testProgramManager.getCurrentTestProgramIndex();
            Vue.bus.emit('testSchedule', {
              index: testProgramIndex,
              testStatus: this.testProgramManager.getProgramTestStatusByIndex(testProgramIndex),
              testResult: this.testProgramManager.getProgramTestResultByIndex(testProgramIndex),
            });
            // 向前端发送报文消息
            Vue.bus.emit('messageInfo', message);
            // 发送报文到前端
            // 判断是否符合通过
            this.testPassJudger.addMessage(this.testProgramManager.getCurrentTestProgramIndex(), message);
            this.currentTempPassStatus = this.testPassJudger.passJudge(this.testProgramManager.getCurrentTestProgramID());
            // 如果当前测试不通过，立即跳转进行下一个条目测试
            if (this.currentTempPassStatus === false) {
              if (this.firstReceivedMessageTimer !== null) {
                clearTimeout(this.firstReceivedMessageTimer);
              }
              this.testProgramManager.setProgramTestStatusByIndex(testProgramIndex, '测试完成');
              if (this.currentTempPassStatus) {
                this.testProgramManager.setProgramTestResultByIndex(testProgramIndex, '测试通过');
              } else {
                this.testProgramManager.setProgramTestResultByIndex(testProgramIndex, '测试不通过');
              }
              Vue.bus.emit('testSchedule', {
                index: testProgramIndex,
                testStatus: this.testProgramManager.getProgramTestStatusByIndex(testProgramIndex),
                testResult: this.testProgramManager.getProgramTestResultByIndex(testProgramIndex),
              });
              this.changeCurrentTestItem();
            }
          }
        });
        socket.on('close', () => {
        });
      });
    }
  }

  // 结束测试
  endTest = () => {
    this.testReadyFlag = false;
  }

  // 切换测试程序条目
  changeCurrentTestItem = () => {
    this.testFinishedFlag = this.testProgramManager.setCurrentTestProgramIndexToNext();
    if (this.testFinishedFlag) {
      // 结束测试
      this.currentTempPassStatus = false;
      this.currentBMSReadyFlag = false;
    }
  }
}

export default TestController;
