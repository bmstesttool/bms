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
          <el-table
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
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Translator from '@/common/translator';
import Judge from '@/common/judge';

const SerialPort = require('serialport');
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
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
      socket: null,
      server: null,
      translator: new Translator(),
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
      messageBuffer: [],
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
              const judgement = this.judge.judge(message, this.currentTestCase);
              switch (judgement) {
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
              if (this.currentTestCase.name === 'DP.4001') {
                clearTimeout(this.donotReceiveMessageTimer);
                this.donotReceiveMessageTimer = setTimeout(() => {
                  this.testCaseList[this.currentTestCase.index].result = '成功';
                  this.testCaseList[this.currentTestCase.index].status = '测试完成';
                  this.switchToNextTestCase();
                  this.donotReceiveMessageTimer = null;
                }, 1000);
              }
            }
          }
          this.$db.message.insert(message, (err, doc) => {
            this.messageBuffer.push(doc);
            // this.$refs.messageTable.bodyWrapper.scrollTop = this.$refs.messageTable.bodyWrapper.scrollHeight;
          });
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
          baudRate: 115200,
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
        const parser = port.pipe(new InterByteTimeout({ interval: 30, maxBufferSize: 32 }));
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
      } else {
        this.testState = true;
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
        }, 5000);
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
      this.port.write(sendBuf);
    },
  },

  mounted() {
    this.$db.message.find({}).sort({ time: 1 }).exec((err, docs) => {
      this.messageTable = docs;
    });
    this.$db.message.remove({}, { multi: true });
    this.updateProgramList();

    SerialPort.list().then(
      (ports) => {
        this.channelList = ports;
      },
      (err) => console.error(err),
    );

    setInterval(() => {
      this.messageTable.push(...this.messageBuffer);
      this.messageBuffer = [];
    }, 500);
  },
};
</script>

<style lang="scss" scoped>
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
</style>
