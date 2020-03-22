<template>
  <div class="programTest">
    <div class="function-area">
      <div>
        <span>端口号：</span>
        <el-select
          v-model="channel"
          placeholder="请选择端口号"
          size="mini"
          value-key="name"
        >
          <el-option
            v-for="(item, index) in channelList"
            :key="index"
            :label="item.name"
            :value="item"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          @click="onClickOpen"
        >{{ link.linked ? '断开' : '监听' }}</el-button>
        <el-checkbox v-model="capture" style="margin-left: 10px;">允许CAN报文捕获</el-checkbox>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          @click="selectTestProgram"
        >选择测试程序</el-button>
        <el-dialog title='测试程序列表' :visible.sync='openProgramDialogFlag'>
          <el-table
            ref='testProgramListRef'
            :data='testProgramList'
            highlight-current-row
            @current-change='selectTestProgramList'
            >
            <el-table-column property='programName' label='程序名' width='150'></el-table-column>
            <el-table-column property='createOperator' label='创建人' width='200'></el-table-column>
            <el-table-column property='createDate' label='更新时间'></el-table-column>
            <el-table-column label='正确性'>
              <template slot-scope='scope'>{{ scope.row.correctFlag ? '正确' : '未验证' }}</template>
            </el-table-column>
          </el-table>
          <div slot='footer' class='dialog-footer'>
            <el-button @click='confirmOpenProgramHandle(false)'>取 消</el-button>
            <el-button type='primary' @click='confirmOpenProgramHandle(true)'>确 定</el-button>
          </div>
        </el-dialog>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 10px;"
          @click="testStatusTaggle()"
        >{{testButtonStatus ? '开始测试' : '停止测试'}}</el-button>
      </div>
    </div>
    <div class="message-area">
      <el-tabs v-model="activeTestTab">
        <el-tab-pane label="测试进度" name="testSchedule">
          <el-table
            :data="currentTestProgram"
            stripe
            size="mini"
            style="width: 100%">
            <el-table-column
              type="index"
              prop="index"
              width="50">
            </el-table-column>
            <el-table-column
              prop="testItemName"
              label="测试项"
              width="180">
            </el-table-column>
            <el-table-column
              prop="testItemDescription"
              label="测试内容"
              width="180">
            </el-table-column>
            <el-table-column
              prop="testItemParams"
              label="测试参数"
              width="180">
            </el-table-column>
            <el-table-column
              prop="testStatus"
              label="测试状态"
              width="180">
            </el-table-column>
            <el-table-column
              prop="testResult"
              label="测试结果">
            </el-table-column>
            <el-table-column
              prop="enabledReport"
              label="是否生成报告">
              <template slot-scope="scope">
                {{ scope.row.enabledReport ? '生成' : '不生成'}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="报文翻译" name="messageTranslate">
          <el-scrollbar style="width: 95%; height: 800px;">
            <el-table
              :data="messageTable"
              ref="messageTable"
              size="mini"
              border
            >
              <el-table-column type="index" label="帧序号" width="100" align="center"></el-table-column>
              <el-table-column label="收发标志" prop="flag" width="70" align="center"></el-table-column>
              <el-table-column label="时间戳" prop="time" width="170" align="center"></el-table-column>
              <el-table-column label="帧ID" prop="id" width="100" align="center">
                <template slot-scope="scope">
                  <span>0x{{ scope.row.id.toString(16).toUpperCase() }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数据长度" prop="dataLength" width="70" align="center"></el-table-column>
              <el-table-column label="数据" prop="data" width="300" show-overflow-tooltip></el-table-column>
              <el-table-column label="报文翻译" prop="text" show-overflow-tooltip></el-table-column>
            </el-table>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="报文统计" name="messageStatistic">报文统计</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>

import TestController from '@/common/testController';

// const net = require('net');
export default {
  name: 'test',

  data() {
    return {
      channel: { name: '127.0.0.1:8899', type: 'server' },
      channelList: [
        { name: '127.0.0.1:8899', type: 'server' },
        { name: 'COM1', type: 'serial' },
      ],
      capture: true,
      link: {
        linked: false,
        listened: false,
      },
      messageTable: [],
      currentTestIndex: 1,
      currentTestResult: 0,
      activeTestTab: 'testSchedule',
      testController: null,
      testProgramList: [
        {
          programName: 'test01',
          createOperator: 'liujun',
          createDate: '2020-03-03 17:50:21',
          correctFlag: true,
        },
        {
          programName: 'test02',
          createOperator: 'daiwei',
          createDate: '2020-03-03 17:50:21',
          correctFlag: true,
        },
        {
          programName: 'test03',
          createOperator: 'daiwei',
          createDate: '2020-03-03 17:50:21',
          correctFlag: false,
        },
      ],
      currentTestProgram: [
        {
          index: 0, // id代表DP1001的标识，index时当前测试的索引，考虑到可能会有id相同的情况
          id: 1,
          testItemName: 'DP1001',
          testItemDescription: '握手测试',
          testItemParams: '暂无',
          testStatus: '未测试',
          testResult: '测试结果',
          enabledReport: true,
        },
        {
          index: 1,
          id: 2,
          testItemName: 'DP1002',
          testItemDescription: '握手测试2',
          testItemParams: '暂无',
          testStatus: '未测试',
          testResult: '测试结果',
          enabledReport: true,
        },
      ],
      openProgramDialogFlag: false,
      testButtonStatus: true,
    };
  },

  methods: {
    handleMessageInfo(message) {
      this.receiveProcess(message);
    },
    handleTestScheduleInfo(testScheduleInfo) {
      this.$set(this.currentTestProgram[testScheduleInfo.index], 'testStatus', testScheduleInfo.testStatus);
      this.$set(this.currentTestProgram[testScheduleInfo.index], 'testResult', testScheduleInfo.testResult);
    },
    receiveProcess(message) {
      if (message) {
        this.$db.message.insert(message, (err, doc) => {
          console.log(err, doc);
          this.messageTable.push(doc);
          this.$refs.messageTable.bodyWrapper.scrollTop = this.$refs.messageTable.bodyWrapper.scrollHeight;
        });
      }
    },
    onClickOpen() {
      const testController = new TestController(this.currentTestProgram, 8899, '127.0.0.1');
      this.testController = testController;
    },
    testStatusTaggle() {
      if (this.testButtonStatus) {
        this.testButtonStatus = !this.testButtonStatus;
        this.testController.readyTest();
        this.testController.startTest();
      } else {
        this.testButtonStatus = !this.testButtonStatus;
        this.testController.endTest();
      }
    },
    selectTestProgram() {
      this.openProgramDialogFlag = true;
    },
    // 确认或取消选择测试程序
    confirmOpenProgramHandle(flag) {
      if (flag) {
        this.openProgramDialogFlag = false;
      }
      this.openProgramDialogFlag = false;
    },
    // 选择测试程序
    selectTestProgramList(row) {
      const that = this;
      that.currentSelectedTestProgram = {
        programName: row.programName,
        createOperator: row.createOperator,
        createDate: row.createDate,
        correctFlag: row.correctFlag,
      };
    },
  },
  mounted() {
    this.$db.message.find({}).sort({ time: 1 }).exec((err, docs) => {
      this.messageTable = docs;
    });
    // this.$db.message.remove({}, { multi: true });
    // 开启BMS消息监听
    this.$bus.on('messageInfo', this.handleMessageInfo);
    this.$bus.on('testSchedule', this.handleTestScheduleInfo);
  },
  beforeDestroy() {
    // 关闭BMS消息监听
    this.$bus.off('messageInfo', this.handleMessageInfo);
    this.$bus.off('testSchedule', this.handleTestScheduleInfo);
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

.el-tabs__item {
  font-size: 16px;
}
</style>
