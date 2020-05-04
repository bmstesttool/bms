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
            :disabled="program.name === 'DP.1001' || program.name === 'DP.3002' || program.name === 'DN.3005' || program.name === 'DN.4002'"
          >
          </el-option>
        </el-select>
        <el-button type="primary" size="mini"  style="margin-left: 10px;" @click="onClickStartTest" :disabled="!open || !currentProgram">{{testState ? '结束测试' : '开始测试'}}</el-button>
        <el-button type="primary" size="mini" @click="handleMessageTable" :disabled="(currentTestID === -1 && testState === false) ? true : false">保存测试结果</el-button>
        <el-button type="primary" size="mini" @click="clearMessageSql">清空数据库</el-button>
        <el-button type="primary" size="mini" @click="addMessageSql">添加数据</el-button>
      </div>
    </div>
    <div class="message-area">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="测试进度" name="schedule">
          <vxe-table
            ref="testCaseList"
            :data.sync="testCaseList"
            size="mini"
            border
            height="540"
            auto-resize
            show-overflow
          >
            <vxe-table-column title="序号" field="index" width="80" align="center"></vxe-table-column>
            <vxe-table-column title="名称" field="name" width="80" align="center"></vxe-table-column>
            <vxe-table-column title="描述" field="description" align="center" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="参数" field="param" align="center" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="测试状态" field="status" align="center" width="100"></vxe-table-column>
            <vxe-table-column title="测试结果" field="result" align="center" width="100"></vxe-table-column>
            <vxe-table-column title="生成报告" field="report" align="center" width="100">
              <template slot-scope="scope">
                <span>{{scope.row.report ? '是' : '否'}}</span>
              </template>
            </vxe-table-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane label="报文翻译" name="translation">
          <!-- <el-table
            :data="messageTable"
            ref="messageTable"
            size="mini"
            border
            height="540"
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
            height="540"
            auto-resize
            show-overflow
            :row-class-name="tableRowClassName"
          >
            <vxe-table-column type="seq" title="帧序号" width="80" align="center"></vxe-table-column>
            <vxe-table-column title="报文标签" field="messageLabel" width="80" align="center"></vxe-table-column>
            <vxe-table-column title="收发标志" field="flag" width="70" align="center"></vxe-table-column>
            <vxe-table-column title="时间戳" field="time" width="180" align="center"></vxe-table-column>
            <vxe-table-column title="帧ID" field="id" width="80" align="center">
              <template slot-scope="scope">
                <span>0x{{ scope.row.id.toString(16).toUpperCase() }}</span>
              </template>
            </vxe-table-column>
            <vxe-table-column title="数据长度" field="dataLength" width="70" align="center"></vxe-table-column>
            <vxe-table-column title="数据" field="dataStr" width="240" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="报文翻译" field="text" width="200" show-overflow-tooltip></vxe-table-column>
            <vxe-table-column title="失败原因" field="errorContent" show-overflow-tooltip></vxe-table-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane label="报文统计" name="statistic">
          <vxe-table
            ref="messageStatisticTable"
            :data="messageStatisticTable"
            size="mini"
            border
            height="540"
            auto-resize
            show-overflow
          >
            <vxe-table-column title="报文标签" field="messageLabel" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="报文总次数" field="messageCount" width="120" align="center"></vxe-table-column>
            <vxe-table-column title="当前间隔时间(ms)" field="currentDuration" width="200" align="center"></vxe-table-column>
            <vxe-table-column title="最小间隔时间(ms)" field="minDuration" width="200" align="center"></vxe-table-column>
            <vxe-table-column title="最大间隔时间(ms)" field="maxDuration" width="200" align="center"></vxe-table-column>
            <vxe-table-column title="平均间隔时间(ms)" field="averageDuration" align="center"></vxe-table-column>
          </vxe-table>
        </el-tab-pane>
      </el-tabs>
      <el-checkbox-group v-model="isReportList">
        <el-checkbox label="测试项目"></el-checkbox>
        <el-checkbox label="报文翻译"></el-checkbox>
        <el-checkbox label="报文统计"></el-checkbox>
        <el-button class="export-button" type="primary" @click="handleExportMessage" size="mini">一键导出</el-button>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import Translator from '@/common/translator';
import Statistic from '@/common/statistic';
import Judge from '@/common/judge';
import Store from '@/common/store';

const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');
const net = require('net');
const xlsx = require('xlsx');
const xeUtils = require('xe-utils');

export default {
  name: 'test',
  props: {
    testDisplay: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
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
      formats: new Store(),
      isReportList: ['测试项目', '报文翻译', '报文统计'],
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
      this.currentTestID = this.nedbLastTestID + 1;
      this.testCaseList = [
        {
          description: '检测CHM报文',
          id: 11001,
          index: 0,
          name: 'DP.1001',
          param: '',
          report: true,
          result: '',
          status: '未开始',
        },
        {
          description: '检测CRM报文',
          id: 11002,
          index: 0,
          name: 'DP.1002',
          param: '',
          report: true,
          result: '',
          status: '未开始',
        },
        {
          description: '检测CRM报文',
          id: 11002,
          index: 0,
          name: 'DP.1002',
          param: '',
          report: true,
          result: '',
          status: '未开始',
        },
      ];
      this.messageTable = [
        {
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
          errorFlag: true,
          errorContent: 'CHM周期错误',
        },
        {
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
        },
        {
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
        },
      ];
      this.statistic.reset();
      this.messageStatisticTable = this.statistic.statistic(this.messageTable[0]);
      const historyMessage = {
        testID: this.currentTestID,
        testResult: [
          {
            testCaseID: this.testCaseList[0].id,
            testCaseName: this.testCaseList[0].name,
            testCaseList: this.testCaseList,
            messageTable: this.messageTable,
            messageStatisticTable: this.messageStatisticTable,
          },
        ],
      };
      console.log(historyMessage);
      if (this.messageSaveFlag !== 1) {
        this.messageSaveFlag = 1;
        this.$db.message.find({ testID: this.currentTestID }, (err, docs) => {
          if (docs.length === 0) {
            this.$db.message.insert(historyMessage, () => {
              // this.messageTable.push(doc);
              this.messageSaveFlag = 2;
              this.$message.info('上次测试结果存储完成');
              // this.$refs.messageTable.bodyWrapper.scrollTop = this.$refs.messageTable.bodyWrapper.scrollHeight;
            });
          } else {
            this.$message.info('改测试结果已经保存');
          }
        });
      }
    },

    handleMessageTable() {
      // if (this.messageSaveFlag !== 1) {
      //   this.messageSaveFlag = 1;
      //   this.$db.message.find({ testID: this.currentTestID }, (err, docs) => {
      //     if (docs.length === 0) {
      //       this.$db.message.insert(this.messageTable, () => {
      //         // this.messageTable.push(doc);
      //         this.messageSaveFlag = 2;
      //         this.$message.info('上次测试结果存储完成');
      //         // this.$refs.messageTable.bodyWrapper.scrollTop = this.$refs.messageTable.bodyWrapper.scrollHeight;
      //       });
      //     } else {
      //       this.$message.info('改测试结果已经保存');
      //     }
      //   });
      // }

      // 初始化历史消息存储结构, 目前暂时只考虑单个测试例的情况
      const historyMessage = {
        testID: this.currentTestID,
        testResult: [
          {
            testCaseID: this.testCaseList[0].id,
            testCaseName: this.testCaseList[0].name,
            testCaseList: this.testCaseList[0],
            messageTable: this.messageTable,
            messageStatisticTable: this.messageStatisticTable,
          },
        ],
      };

      if (this.messageSaveFlag !== 1) {
        this.messageSaveFlag = 1;
        this.$db.message.find({ testID: this.currentTestID }, (err, docs) => {
          if (docs.length === 0) {
            this.$db.message.insert(historyMessage, () => {
              // this.messageTable.push(doc);
              this.messageSaveFlag = 2;
              this.$message.info('上次测试结果存储完成');
              // 更新nedbLastTestID和currentTestID状态
              this.nedbLastTestID += 1;
              this.currentTestID = -1;
            });
          } else {
            this.$message.info('改测试结果已经保存');
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
    handleExportMessage() {
      if (this.isReportList.length === 0) {
        this.$message.info('请选择需要导出的表格');
      } else {
        const wb = xlsx.utils.book_new();
        console.log(this.isReportList.indexOf('测试项目'));
        if (this.isReportList.indexOf('测试项目') > -1) {
          const columns = this.$refs.testCaseList.visibleColumn;
          const colHead = {};
          let rowList = this.$refs.testCaseList.tableFullData;
          const sheetCols = [];
          const footList = [];
          columns.forEach((column) => {
            colHead[column.id] = xeUtils.toString(column.getTitle());
            sheetCols.push({
              wpx: column.renderWidth,
            });
          });
          rowList = this.getColData(this.$refs.testCaseList, columns, rowList);
          const testCaseListSheet = xlsx.utils.json_to_sheet(([colHead]).concat(rowList).concat(footList), {
            skipHeader: true,
          });
          testCaseListSheet['!cols'] = sheetCols;
          xlsx.utils.book_append_sheet(wb, testCaseListSheet, '测试项目');
        }
        if (this.isReportList.indexOf('报文翻译') > -1) {
          const columns1 = this.$refs.messageTable.visibleColumn;
          const colHead1 = {};
          let rowList1 = this.$refs.messageTable.tableFullData;
          const sheetCols1 = [];
          const footList1 = [];
          columns1.forEach((column) => {
            colHead1[column.id] = xeUtils.toString(column.getTitle());
            sheetCols1.push({
              wpx: column.renderWidth,
            });
          });
          rowList1 = this.getColData(this.$refs.messageTable, columns1, rowList1);
          const messageTableSheet = xlsx.utils.json_to_sheet(([colHead1]).concat(rowList1).concat(footList1), {
            skipHeader: true,
          });
          messageTableSheet['!cols'] = sheetCols1;
          xlsx.utils.book_append_sheet(wb, messageTableSheet, '报文翻译');
        }
        if (this.isReportList.indexOf('报文统计') > -1) {
          const columns2 = this.$refs.messageStatisticTable.visibleColumn;
          const colHead2 = {};
          let rowList2 = this.$refs.messageStatisticTable.tableFullData;
          const sheetCols2 = [];
          const footList2 = [];
          columns2.forEach((column) => {
            colHead2[column.id] = xeUtils.toString(column.getTitle());
            sheetCols2.push({
              wpx: column.renderWidth,
            });
          });
          rowList2 = this.getColData(this.$refs.messageStatisticTable, columns2, rowList2);
          const messageStatisticTableSheet = xlsx.utils.json_to_sheet(([colHead2]).concat(rowList2).concat(footList2), {
            skipHeader: true,
          });
          messageStatisticTableSheet['!cols'] = sheetCols2;
          xlsx.utils.book_append_sheet(wb, messageStatisticTableSheet, '报文统计');
        }

        const wbout = xlsx.write(wb, {
          bookType: 'xlsx',
          bookSST: false,
          type: 'binary',
        });

        const blob = new Blob([this.toBuffer(wbout)], {
          type: 'application/octet-stream',
        }); // 保存导出

        const options = {
          filename: '测试结果',
          type: 'xlsx',
        };
        this.downloadFile(blob, options);
      }
    },
    downloadFile(blob, options) {
      if (window.Blob) {
        const filename = options.filename;
        const type = options.type;
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, ''.concat(filename, '.').concat(type));
        } else {
          const linkElem = document.createElement('a');
          linkElem.target = '_blank';
          linkElem.download = ''.concat(filename, '.').concat(type);
          linkElem.href = URL.createObjectURL(blob);
          document.body.appendChild(linkElem);
          linkElem.click();
          document.body.removeChild(linkElem);
        }
      }
    },
    toBuffer(wbout) {
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);

      for (let index = 0; index !== wbout.length; index += 1) {
        view[index] = wbout.charCodeAt(index) & 0xFF;
      }

      return buf;
    },
    getColData($xetable, columns, datas) {
      return datas.map((row, rowIndex) => {
        const item = {};
        columns.forEach((column, columnIndex) => {
          let cellValue = '';

          switch (column.type) {
            // v3.0 废弃 type=index
            case 'seq':
            case 'index':
              cellValue = this.getSeq($xetable, row, rowIndex, column, columnIndex);
              break;
            default:
              const cell = this.getCell($xetable, {
                row1: row,
                column1: column,
              });

              cellValue = cell ? cell.innerText.trim() : this.getCellLabel(row, column, {
                $table: $xetable,
              });
              break;
          }
          item[column.id] = xeUtils.toString(cellValue);
        });
        return item;
      });
    },
    getSeq($xetable, row1, rowIndex1, column1, columnIndex1) {
      // 在 v3.0 中废弃 startIndex、indexMethod
      const seqOpts = $xetable.seqOpts;
      const seqMethod = seqOpts.seqMethod || column1.seqMethod || column1.indexMethod;
      return seqMethod ? seqMethod({
        row: row1,
        rowIndex: rowIndex1,
        column: column1,
        columnIndex: columnIndex1,
      }) : (seqOpts.startIndex || $xetable.startIndex) + rowIndex1 + 1;
    },
    getCell($xetable, { row1, column1 }) {
      const rowid = this.getRowid($xetable, row1);
      const bodyElem = $xetable.$refs[`${column1.fixed || 'table'}Body`] || $xetable.$refs.tableBody;
      if (bodyElem && bodyElem.$el) {
        return bodyElem.$el.querySelector(`.vxe-body--row[data-rowid="${rowid}"] .${column1.id}`);
      }
      return null;
    },
    getCellValue(row, column) {
      return xeUtils.get(row, column.property);
    },
    getCellLabel(row, column, params) {
      const { formatter } = column;
      const cellValue = this.getCellValue(row, column);
      let cellLabel = cellValue;
      if (params && formatter) {
        let rest;
        let formatData;
        const { $table } = params;
        const colid = column.id;
        const fullAllDataRowMap = $table.fullAllDataRowMap;
        const cacheFormat = fullAllDataRowMap.has(row);
        if (cacheFormat) {
          rest = fullAllDataRowMap.get(row);
          formatData = rest.formatData;
          if (!formatData) {
            formatData = fullAllDataRowMap.get(row).formatData = {};
          }
          if (rest && formatData[colid]) {
            if (formatData[colid].value === cellValue) {
              return formatData[colid].label;
            }
          }
        }
        if (xeUtils.isString(formatter)) {
          const globalFunc = this.formats.get(formatter);
          cellLabel = globalFunc ? globalFunc({ cellValue, row, column }) : '';
        } else if (xeUtils.isArray(formatter)) {
          const globalFunc = this.formats.get(formatter[0]);
          cellLabel = globalFunc ? globalFunc({ cellValue, row, column }, ...formatter.slice(1)) : '';
        } else {
          cellLabel = formatter(Object.spread({ cellValue }, ...params));
        }
        if (formatData) {
          formatData[colid] = { value: cellValue, label: cellLabel };
        }
      }
      return cellLabel;
    },
    getRowid($xetable, row) {
      const rowId = xeUtils.get(row, this.getRowkey($xetable));
      return rowId ? encodeURIComponent(rowId) : '';
    },
    getRowkey($xetable) {
      return $xetable.rowId || '_XID';
    },
  },

  watch: {
    testDisplay(newVal) {
      if (newVal === true) {
        console.log(`testDisplay: ${this.testDisplay}`);
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
          }
        });
      }
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
}

.programTest /deep/ .el-tabs__header {
  background-color: #E9EEF3 !important;
}

.programTest /deep/ .el-tab-pane {
  height: calc(100% - 200px) !important;
  padding: 0px !important;
}

.function-area {
  width: 100%;
  height: 40px;
}

.message-area {
  width: 100%;
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

.export-button {
  margin-top: 15px;
  margin-left: 10px;
}
</style>
