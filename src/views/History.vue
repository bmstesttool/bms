<template>
  <div class="history">
    <div class="function-area">
      <span>请选择历史测试记录: </span>
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
      <el-popconfirm
        confirmButtonText='确定'
        cancelButtonText='取消'
        icon="el-icon-info"
        iconColor="red"
        title="是否清空历史测试记录"
        @onConfirm="clearMessageSql()"
      >
      <el-button type="primary" class="clear-button" slot="reference">清空历史测试记录</el-button>
      </el-popconfirm>
    </div>
    <div class="message-area">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="测试进度" name="scheduleHistoy">
          <vxe-table
            ref="testCaseList"
            :data="testCaseList"
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
            <vxe-table-column title="测试状态" field="status" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="测试结果" field="result" width="100" align="center"></vxe-table-column>
            <vxe-table-column title="生成报告" field="report" width="100" align="center">
              <template slot-scope="scope">
                <span>{{scope.row.report ? '是' : '否'}}</span>
              </template>
            </vxe-table-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane label="报文翻译" name="translationHistory">
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
        <el-tab-pane label="报文统计" name="statisticHistory">
          <!-- <el-button type="primary" @click="handleExportMessageStatistic" size="mini">导出</el-button> -->
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

import Store from '@/common/store';

const xlsx = require('xlsx');
const xeUtils = require('xe-utils');

export default {
  name: 'history',
  props: {
    historyDisplay: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      currentTab: 'scheduleHistoy',
      testCaseList: [],
      messageTable: [],
      messageStatisticTable: [],
      historyTestRecordIndexList: [],
      currentHistoryTestRecordIndex: -1,
      nedbLastTestID: -1,
      formats: new Store(),
      isReportList: ['测试项目', '报文翻译', '报文统计'],
    };
  },

  methods: {
    onSelectHistoryTestRecord() {
      this.$db.message.find({ testID: this.currentHistoryTestRecordIndex }).sort({ time: 1 }).exec((err1, docs1) => {
        if (err1 === null) {
          if (docs1.length > 0) {
            console.log(docs1[0]);
            this.testCaseList = docs1[0].testResult[0].testCaseList;
            this.messageTable = docs1[0].testResult[0].messageTable;
            this.messageStatisticTable = docs1[0].testResult[0].messageStatisticTable;
          } else {
            this.testCaseList = [];
            this.messageTable = [];
            this.messageStatisticTable = [];
          }
        } else {
          this.testCaseList = [];
          this.messageTable = [];
          this.messageStatisticTable = [];
        }
      });
    },
    updateHistoryTestRecordIndexList() {
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
                console.log(docs1[0]);
                this.testCaseList = docs1[0].testResult[0].testCaseList;
                this.messageTable = docs1[0].testResult[0].messageTable;
                this.messageStatisticTable = docs1[0].testResult[0].messageStatisticTable;
              } else {
                this.testCaseList = [];
                this.messageTable = [];
                this.messageStatisticTable = [];
              }
            } else {
              this.testCaseList = [];
              this.messageTable = [];
              this.messageStatisticTable = [];
            }
          });
        }
      });
    },
    clearMessageSql() {
      if (this.historyTestRecordIndexList.length > 0) {
        this.$db.message.remove({}, { multi: true });
        this.updateHistoryTestRecordIndexList();
      } else {
        this.$message.info('历史测试记录已经为空');
      }
    },
    tableRowClassName({ row, rowIndex }) {
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
    historyDisplay(newVal) {
      if (newVal === true) {
        this.updateHistoryTestRecordIndexList();
        console.log(`historyDisplay: ${this.historyDisplay}`);
      }
    },
  },
  mounted() {
    this.updateHistoryTestRecordIndexList();
  },
  destroyed() {
  },
};
</script>

<style scoped>
.history {
  height: 100%;
}

.history /deep/ .el-tab-pane {
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

.clear-button {
  font-size: 12px;
  height: 30px;
  padding: 0px 10px;
  margin: 0px 10px;
}

.vxe-table /deep/ .warning-row {
  background: #E6A23C !important;
}

.export-button {
  margin-top: 10px;
  margin-left: 10px;
}

.history /deep/ .el-tabs__header {
  background-color: #E9EEF3 !important;
}
</style>
