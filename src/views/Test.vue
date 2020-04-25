<template>
  <div class="programTest">
    <div class="function-area">
      <div>
        <span>端口号：</span>
        <el-select
          v-model="channel"
          placeholder="请选择端口号"
          size="mini"
          value-key="path"
        >
          <el-option
            v-for="(item, index) in channelList"
            :key="index"
            :label="item.path"
            :value="item"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          @click="onClickOpen"
        >{{ open ? '关闭' : '打开' }}</el-button>
        <el-checkbox v-model="capture" style="margin-left: 10px;">允许CAN报文捕获</el-checkbox>
        <span style="margin-left: 20px;">请选择测试程序: </span>
        <el-select
          class="programSelect"
          v-model="currentProgram"
          placeholder="请选择"
          size="mini"
          value-key="name"
          @change="onSelectProgram"
        >
          <el-option
            v-for="(program, index) in programList"
            :key="index"
            :label="program.name"
            :value="program"
          >
          </el-option>
        </el-select>
        <el-button type="primary" size="mini" @click="onClickStartTest" :disabled="!open || !currentProgram">{{testState ? '结束测试' : '开始测试'}}</el-button>
        <el-button type="primary" size="mini" @click="handleMessageTable">保存</el-button>
        <el-button type="primary" size="mini" @click="clearMessageSql">清空数据库</el-button>
        <el-button type="primary" size="mini" @click="addMessageSql">添加数据</el-button>
      </div>
    </div>
    <div class="message-area">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="测试进度" name="schedule">
          <el-table
            :data.sync="testCaseList"
            size="mini"
            border
          >
            <el-table-column label="序号" prop="index" width="50"></el-table-column>
            <el-table-column label="名称" prop="name" width="80"></el-table-column>
            <el-table-column label="描述" prop="description" show-overflow-tooltip></el-table-column>
            <el-table-column label="参数" prop="param" show-overflow-tooltip></el-table-column>
            <el-table-column label="测试状态" prop="status" width="100"></el-table-column>
            <el-table-column label="测试结果" prop="result" width="100"></el-table-column>
            <el-table-column label="生成报告" prop="report" width="100">
              <template slot-scope="scope">
                <span>{{scope.row.report ? '是' : '否'}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="报文翻译" name="translation">
          <!-- <el-table
            :data="messageTable"
            ref="messageTable"
            size="mini"
            border
            height="800"
          >
            <el-table-column type="index" label="帧序号" width="100" align="center"></el-table-column>
            <el-table-column label="收发标志" prop="flag" width="70" align="center"></el-table-column>
            <el-table-column label="时间戳" prop="time" width="180" align="center"></el-table-column>
            <el-table-column label="帧ID" prop="id" width="100" align="center">
              <template slot-scope="scope">
                <span>0x{{ scope.row.id.toString(16).toUpperCase() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据长度" prop="dataLength" width="70" align="center"></el-table-column>
            <el-table-column label="数据" prop="dataStr" width="300" show-overflow-tooltip></el-table-column>
            <el-table-column label="报文翻译" prop="text" show-overflow-tooltip></el-table-column>
          </el-table> -->
          <vxe-table
            ref="messageTable"
            :data="messageTable"
            size="mini"
            border
            height="800"
            auto-resize
            show-overflow
            :row-class-name="tableRowClassName"
          >
            <vxe-table-column type="seq" title="帧序号" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="报文标签" field="messageLabel" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="收发标志" field="flag" width="70" align="center"></vxe-table-column>
            <vxe-table-column title="时间戳" field="time" width="180" align="center"></vxe-table-column>
            <vxe-table-column title="帧ID" field="id" width="100" align="center">
              <template slot-scope="scope">
                <span>0x{{ scope.row.id.toString(16).toUpperCase() }}</span>
              </template>
            </vxe-table-column>
            <vxe-table-column title="数据长度" field="dataLength" width="70" align="center"></vxe-table-column>
            <vxe-table-column title="数据" field="dataStr" width="300" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="报文翻译" field="text" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="失败原因" field="errorContent" show-overflow-tooltip></vxe-table-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane label="报文统计" name="statistic">
          <vxe-table
            ref="messageStatisticTable"
            :data="messageStatisticTable"
            size="mini"
            border
            height="800"
            auto-resize
            show-overflow
          >
            <vxe-table-column title="报文标签" field="messageLabel" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="报文总次数" field="messageCount" width="120" align="center"></vxe-table-column>
            <vxe-table-column title="当前间隔时间(ms)" field="currentDuration" align="center"></vxe-table-column>
            <vxe-table-column title="最小间隔时间(ms)" field="minDuration" align="center"></vxe-table-column>
            <vxe-table-column title="最大间隔时间(ms)" field="maxDuration" align="center"></vxe-table-column>
            <vxe-table-column title="平均间隔时间(ms)" field="averageDuration" align="center"></vxe-table-column>
          </vxe-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Translator from '@/common/translator';
import Statistic from '@/common/statistic';
import Judge from '@/common/judge';

const SerialPort = require('serialport');
// const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
const Delimiter = require('@serialport/parser-delimiter');
const net = require('net');

export default {
  name: 'test',

  data() {
    return {
      channel: null,
      channelList: [],
      port: null,
      open: false,
      capture: true,
      link: {
        linked: false,
        listened: false,
      },
      messageTable: [],
      messageStatisticTable: [],
      socket: null,
      server: null,
      translator: new Translator(),
      statistic: new Statistic(),
      judge: new Judge(),
      currentTestCase: {},
      testCaseList: [],
      programList: [],
      currentProgram: null,
      currentTab: 'schedule',
      cannotReceiveMessageTimer: null,
      donotReceiveMessageTimer: null,
      firstReceiveMessageTimer: null,
      testState: false,
      precondition: false,
      nedbLastTestID: 0,
      currentTestID: -1,
      messageSaveFlag: 0, // 0-代表默认状态，1-代表正在存储，2-代表存储完成
    };
  },

  methods: {
    reciveProcess(data) {
      console.log(data.toString('hex'));
      if (data[0] === 0xAA && data[1] === 0x55) {
        switch (data[3]) {
          // 测试命令回复
          case 0x06:
            clearTimeout(this.cannotReceiveMessageTimer);
            console.log('开始测试，等待进入前置条件');
            break;
          // 前置条件回复
          case 0x01:
            console.log('进入前置条件，判断接下来的报文');
            this.precondition = true;
            break;
          default:
            if (this.cannotReceiveMessageTimer != null) {
              clearTimeout(this.cannotReceiveMessageTimer);
            }
            break;
        }
      } else {
        const message = this.translator.translate(data);
        if (message) {
          clearTimeout(this.cannotReceiveMessageTimer);
          if (this.firstReceiveMessageTimer === null) {
            this.firstReceiveMessageTimer = setTimeout(() => {
              this.testCaseList[this.currentTestCase.index].status = '测试完成';
              this.testCaseList[this.currentTestCase.index].result = '失败';
              this.switchToNextTestCase();
              this.firstReceiveMessageTimer = null;
            }, 5000);
          } else {
            clearTimeout(this.firstReceiveMessageTimer);
          }
          if (this.testState && message.flag === '发送' && this.precondition) {
            if (this.currentTestCase.name === 'DN.2009' && this.donotReceiveMessageTimer) {
              this.testCaseList[this.currentTestCase.index].result = '失败';
              this.testCaseList[this.currentTestCase.index].status = '测试完成';
              this.switchToNextTestCase();
              clearTimeout(this.donotReceiveMessageTimer);
              this.donotReceiveMessageTimer = null;
            } else {
              const judgeResult = this.judge.judge(message, this.currentTestCase);
              message.messageLabel = judgeResult.messageLabel;
              message.errorFlag = judgeResult.errorFlag;
              message.errorContent = judgeResult.errorContent;
              switch (judgeResult.testStatus) {
                case 0:
                  console.log('测试失败');
                  this.testCaseList[this.currentTestCase.index].status = '测试完成';
                  this.testCaseList[this.currentTestCase.index].result = '失败';
                  this.switchToNextTestCase();
                  break;
                case 1:
                  console.log('测试成功');
                  this.testCaseList[this.currentTestCase.index].status = '测试完成';
                  this.testCaseList[this.currentTestCase.index].result = '成功';
                  this.switchToNextTestCase();
                  break;
                case 2:
                  console.log('测试进行中');
                  break;
                default:
                  break;
              }
              if (this.currentTestCase.name === 'DP.4001' && judgeResult.messageLabel === 'CSD') {
                clearTimeout(this.donotReceiveMessageTimer);
                this.donotReceiveMessageTimer = setTimeout(() => {
                  if (this.testCaseList[this.currentTestCase.index].status === '正在测试') {
                    this.testCaseList[this.currentTestCase.index].result = '成功';
                    this.testCaseList[this.currentTestCase.index].status = '测试完成';
                    this.switchToNextTestCase();
                    this.donotReceiveMessageTimer = null;
                  }
                }, 1000);
              }
              if (judgeResult.messageLabel === 'CEM' && this.currentTestCase.name.indexOf('DN') !== -1) {
                clearTimeout(this.donotReceiveMessageTimer);
                this.donotReceiveMessageTimer = setTimeout(() => {
                  if (this.testCaseList[this.currentTestCase.index].status === '正在测试') {
                    this.testCaseList[this.currentTestCase.index].result = '成功';
                    this.testCaseList[this.currentTestCase.index].status = '测试完成';
                    this.switchToNextTestCase();
                    this.donotReceiveMessageTimer = null;
                  }
                }, 1000);
              }
              if (judgeResult.messageLabel === 'CST' && this.currentTestCase.name.indexOf('DP') !== -1 && this.currentTestCase.name !== 'DP.4001') {
                clearTimeout(this.donotReceiveMessageTimer);
                this.donotReceiveMessageTimer = setTimeout(() => {
                  if (this.testCaseList[this.currentTestCase.index].status === '正在测试') {
                    this.testCaseList[this.currentTestCase.index].result = '成功';
                    this.testCaseList[this.currentTestCase.index].status = '测试完成';
                    this.switchToNextTestCase();
                    this.donotReceiveMessageTimer = null;
                  }
                }, 1000);
              }
            }
          }
          message.testCaseID = this.currentTestCase.id;
          message.testCaseName = this.currentTestCase.name;
          if (this.currentTestID === -1) {
            this.currentTestID = this.nedbLastTestID + 1;
          }
          message.testID = this.currentTestID;
          this.messageStatisticTable = this.statistic.statistic(message);
          this.messageTable.push(message);
        }
      }
    },

    onClickOpen() {
      if (this.open) {
        this.port.close((err) => {
          if (err) {
            this.$message.error(`关闭串口${this.channel.path}失败！`);
          } else {
            this.open = false;
            this.port = null;
          }
        });
      } else if (this.channel !== null) {
        const port = new SerialPort(this.channel.path, {
          baudRate: 19200,
          autoOpen: false,
        });
        port.open((err) => {
          if (err) {
            this.$message.error(`打开串口${this.channel.path}失败！请检查该串口是否被占用`);
          } else {
            this.open = true;
            this.port = port;
          }
        });
        // const parser = port.pipe(new InterByteTimeout({ interval: 30, maxBufferSize: 32 }));
        const parser = port.pipe(new Delimiter({ delimiter: '\r\n' }));
        parser.on('data', this.reciveProcess);
      }
    },

    createTCPServer() {
      const server = net.createServer();
      server.maxConnections = 1;
      server.on('connection', (socket) => {
        this.link.linked = true;
        console.log('已连接');
        socket.on('data', (data) => {
          this.reciveProcess(data);
        });
        socket.on('close', () => {
          this.link.linked = false;
        });
        this.socket = socket;
      });
      server.on('close', () => {
        this.link.listened = false;
        console.log('TCP server 已关闭');
      });
      server.on('listening', () => {
        this.link.listened = true;
        console.log('正在监听127.0.0.1:8899');
      });
      // server.listen(8899, '127.0.0.1');
      server.listen(8899, '192.168.124.8');
      this.server = server;
    },

    updateProgramList() {
      this.$db.program.find({}).sort({ createTime: 1 }).exec((err, docs) => {
        this.programList = docs;
      });
    },

    onClickStartTest() {
      if (this.testState) {
        this.testState = false;
        this.resetCurrentProgram();
        this.currentTestCase = {};
        clearTimeout(this.cannotReceiveMessageTimer);
        // this.handleMessageTable();
      } else if (!this.testState && this.messageSaveFlag !== 1) {
        this.testState = true;
        // 添加当前测试编号
        if (this.currentTestID === -1) {
          this.currentTestID = this.nedbLastTestID + 1;
        }
        // 重置Statistic信息
        this.statistic.reset();
        this.messageTable = [];
        this.messageSaveFlag = 0;
        this.resetCurrentProgram();
        this.currentTestCase = this.testCaseList[0];
        this.testCaseList[0].status = '正在测试';
        this.precondition = false;
        this.sendTestCaseCmd(this.currentTestCase);
        this.cannotReceiveMessageTimer = setTimeout(() => {
          this.testState = false;
          this.$message.error('5s内未收到报文，请检查通讯是否正常');
          this.testCaseList[0].result = '失败';
          this.testCaseList[0].status = '测试完成';
          // this.handleMessageTable();
        }, 5000);
      } else {
        this.$message.error('正在存储上次测试结果，请稍后再试');
      }
    },

    onSelectProgram(program) {
      this.testCaseList = program.item.map((testCase, index) => {
        testCase.index = index;
        return testCase;
      });
    },

    resetCurrentProgram() {
      this.testCaseList = this.testCaseList.map((testCase) => {
        testCase.status = '未开始';
        testCase.result = '';
        return testCase;
      });
    },

    switchToNextTestCase() {
      const index = this.currentTestCase.index;
      if (index + 1 >= this.testCaseList.length) {
        this.testState = false;
        // this.handleMessageTable();
      } else {
        this.currentTestCase = this.testCaseList[index + 1];
        this.testCaseList[index + 1].status = '正在测试';
        this.sendTestCaseCmd(this.currentTestCase);
        this.precondition = false;
        if (this.currentTestCase.name === 'DN.2009') {
          this.donotReceiveMessageTimer = setTimeout(() => {
            this.testCaseList[this.currentTestCase.index].result = '成功';
            this.testCaseList[this.currentTestCase.index].status = '测试完成';
            this.switchToNextTestCase();
            this.donotReceiveMessageTimer = null;
          }, 1000);
        } else {
          this.cannotReceiveMessageTimer = setTimeout(() => {
            this.testState = false;
            this.$message.error('5s内未收到报文，请检查通讯是否正常');
            this.testCaseList[0].result = '失败';
            this.testCaseList[0].status = '测试完成';
            // this.handleMessageTable();
          }, 5000);
        }
      }
    },

    sendTestCaseCmd(testCase) {
      const param = Buffer.from(testCase.param, 'hex');
      const header = Buffer.alloc(5);
      header[0] = 0xAA;
      header[1] = 0x55;
      header[2] = 2 + param.length;
      header[3] = testCase.id >> 8;
      header[4] = testCase.id & 0xFF;
      const checksum = Buffer.alloc(1);
      const sendBuf = Buffer.concat([header, param, checksum]);
      console.log(sendBuf.toString('hex'));
      this.port.write(sendBuf);
    },

    clearMessageSql() {
      this.$db.message.remove({}, { multi: true });
    },

    addMessageSql() {
      const message = {
        testID: 1,
        testCaseID: '11001',
        testCaseName: 'DP.1001',
        id: 1,
        code: '',
        flag: '发送',
        time: new Date(),
        timestamp: '',
        dataLength: 2,
        data: 123,
        dataStr: 123,
        text: 1,
        messageLabel: 'CHM',
        errorFlag: false,
        errorContent: '',
      };
      message.testID = 1;
      message.testCaseID = '11001';
      message.testCaseName = 'DP.1001';
      message.text = 'TEST1';
      this.$db.message.insert(message, () => {
        message.text = 'TEST2';
        this.$db.message.insert(message, () => {
          // this.messageTable.push(doc);
          message.text = 'TEST3';
          this.$db.message.insert(message, () => {
            message.testID = 2;
            message.testCaseID = '11002';
            message.testCaseName = 'DP.1002';
            message.text = 'TEST1';
            this.$db.message.insert(message, () => {
              message.text = 'TEST2';
              this.$db.message.insert(message, () => {
                message.text = 'TEST3';
                this.$db.message.insert(message, () => {
                  message.testID = 3;
                  message.testCaseID = '11003';
                  message.testCaseName = 'DP.1003';
                  message.text = 'TEST1';
                  this.$db.message.insert(message, () => {
                    message.text = 'TEST2';
                    this.$db.message.insert(message, () => {
                      message.text = 'TEST3';
                      message.messageLabel = 'CHM';
                      message.errorFlag = true;
                      message.errorContent = 'CHM报文内容错误';
                      this.$db.message.insert(message, () => {
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    },

    handleMessageTable() {
      if (this.messageSaveFlag !== 1) {
        this.messageSaveFlag = 1;
        this.this.$db.message.find({ testID: this.currentTestID }, (err, docs) => {
          if (docs.length === 0) {
            this.$db.message.insert(this.messageTable, () => {
              // this.messageTable.push(doc);
              this.messageSaveFlag = 2;
              this.$message.info('上次测试结果存储完成');
              // this.$refs.messageTable.bodyWrapper.scrollTop = this.$refs.messageTable.bodyWrapper.scrollHeight;
            });
          } else {
            this.$message.warn('改测试结果已经保存');
          }
        });
      }
    },

    tableRowClassName({ row, rowIndex }) {
      // console.log(this.messageTable[rowIndex].errorFlag);
      if (this.messageTable[rowIndex].errorFlag) {
        console.log(row);
        return 'warning-row';
      }
      return '';
    },
  },

  mounted() {
    // this.$db.message.find({}).sort({ time: 1 }).exec((err, docs) => {
    //   this.messageTable = docs;
    // });
    // this.$db.message.remove({}, { multi: true });
    this.updateProgramList();

    SerialPort.list().then(
      (ports) => {
        this.channelList = ports;
      },
      (err) => console.error(err),
    );

    this.$db.message.find({}).sort({ testID: -1 }).limit(1).exec((err, docs) => {
      if (err === null) {
        if (docs.length > 0) {
          this.nedbLastTestID = docs[0].testID;
        } else {
          // 第一次测试
          this.nedbLastTestID = 0;
        }
        this.currentTestID = this.nedbLastTestID + 1;
      }
    });

    // setInterval(() => {
    //   this.$refs.messageTable.loadData(this.messageTable);
    //   // this.$refs.messageTable.scrollToRow(this.messageTable[this.messageTable.length - 1]);
    // }, 500);
  },
  destroyed() {
    if (this.open) {
      this.port.close((err) => {
        if (err) {
          this.$message.error(`关闭串口${this.channel.path}失败！`);
        } else {
          this.open = false;
          this.port = null;
        }
      });
    }
  },
};
</script>

<style scoped>
.programTest {
  height: 100%;
  position: relative;
  padding: 5px;
}

.function-area {
  position: absolute;
  width: 100%;
  height: 40px;
}

.message-area {
  position: absolute;
  width: 100%;
  top: 40px;
  bottom: 40px;
}

.programSelect {
  width: 100px;
}

.errorMessage {
  background: #F56C6C;
}

.vxe-table /deep/ .warning-row {
  background: #E6A23C !important;
}
</style>
