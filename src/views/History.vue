<template>
  <div class="programTest">
    <div class="function-area">
      <span style="margin-left: 20px;">请选择历史测试记录: </span>
        <el-select
          v-model="currentHistoryTestRecordIndex"
          placeholder="请选择"
          size="mini"
          value-key="name"
          @change="onSelectHistoryTestRecord"
        >
          <el-option
            v-for="(historyTestRecordIndex, index) in historyTestRecordIndexList"
            :key="index"
            :label="historyTestRecordIndex"
            :value="historyTestRecordIndex"
          >
          </el-option>
        </el-select>
    </div>
    <div class="message-area">
      <vxe-table
        ref="messageTable"
        :data="messageTable"
        size="mini"
        border
        height="800"
        auto-resize
        show-overflow
      >
        <vxe-table-column type="seq" title="帧序号" width="50" align="center"></vxe-table-column>
        <vxe-table-column title="记录序号" field="testID" width="80" align="center"></vxe-table-column>
        <vxe-table-column title="测试项名称" field="testCaseName" width="100" align="center"></vxe-table-column>
        <vxe-table-column title="帧序号" field="id" width="100" align="center"></vxe-table-column>
        <vxe-table-column title="收发标志" field="flag" width="70" align="center"></vxe-table-column>
        <vxe-table-column title="时间戳" field="time" width="180" align="center"></vxe-table-column>
        <vxe-table-column title="帧ID" field="id" width="100" align="center">
          <template slot-scope="scope">
            <span>0x{{ scope.row.id.toString(16).toUpperCase() }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column title="数据长度" field="dataLength" width="70" align="center"></vxe-table-column>
        <vxe-table-column title="数据" field="dataStr" width="100" show-overflow-tooltip></vxe-table-column>
        <vxe-table-column title="报文翻译" field="text" show-overflow-tooltip></vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>

export default {
  name: 'history',

  data() {
    return {
      messageTable: [],
      historyTestRecordIndexList: [],
      currentHistoryTestRecordIndex: -1,
      nedbLastTestID: -1,
    };
  },

  methods: {
    onSelectHistoryTestRecord() {
      this.$db.message.find({ testID: this.currentHistoryTestRecordIndex }).sort({ time: 1 }).exec((err, docs) => {
        if (err === null) {
          if (docs.length > 0) {
            console.log(docs);
            this.messageTable = docs;
          }
        }
      });
    },
  },

  mounted() {
    // 创建索引
    this.$db.message.find({}).sort({ testID: -1 }).limit(1).exec((err, docs) => {
      if (err === null) {
        if (docs.length > 0) {
          this.nedbLastTestID = docs[0].testID;
        } else {
          // 第一次测试
          this.nedbLastTestID = 0;
        }
        console.log(this.nedbLastTestID);
        this.currentHistoryTestRecordIndex = this.nedbLastTestID;
        this.historyTestRecordIndexList = [];
        for (let i = this.currentHistoryTestRecordIndex; i > 0; i -= 1) {
          this.historyTestRecordIndexList.push(i);
        }
        // 设置初始值
        console.log(this.currentHistoryTestRecordIndex);
        this.$db.message.find({ testID: this.currentHistoryTestRecordIndex }).sort({ time: 1 }).exec((err1, docs1) => {
          if (err1 === null) {
            if (docs1.length > 0) {
              console.log(docs1);
              this.messageTable = docs1;
            }
          }
        });
      }
    });
  },
  destroyed() {
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
