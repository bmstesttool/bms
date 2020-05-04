<template>
  <el-container class="home">
    <el-header>
      <el-row :gutter="20" style="margin: 0px;">
        <el-col :span="2"><img class="logo" src="../assets/logo.jpg"></el-col>
        <el-col :span="20" style="-webkit-app-region: drag;"><div class="title">直流桩测试仪</div></el-col>
        <el-col :span="2" style="padding: 0px; text-align: right;">
          <i class="el-icon-minus window-icon" @click="minWindow"></i>
          <i class="el-icon-close window-icon" @click="closeWindow"></i>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-tabs class='main-tab' v-model="activeTab" @tab-click="updateTab" tab-position='left'>
        <el-tab-pane label="程序编辑" name="edit">
          <span class="tab-label" slot='label'><i class="icon iconfont">&#xe61c;</i> 程序编辑</span>
          <Edit :editDisplay='editDisplay'></Edit>
        </el-tab-pane>
        <el-tab-pane label="程序测试" name="test">
          <span class="tab-label" slot='label'><i class="icon iconfont">&#xe6ac;</i> 程序测试</span>
          <Test :testDisplay='testDisplay'></Test>
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="history">
          <span class="tab-label" slot='label'><i class="icon iconfont">&#xe85f;</i> 历史记录</span>
          <History :historyDisplay='historyDisplay'></History>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import Edit from './Edit.vue';
import Test from './Test.vue';
import History from './History.vue';
import '../assets/iconfont/iconfont.css';
import '../assets/iconfont/iconfont';

const { ipcRenderer: ipc } = require('electron');

export default {
  name: 'home',
  components: {
    Edit,
    Test,
    History,
  },
  data() {
    return {
      editDisplay: true,
      testDisplay: false,
      historyDisplay: false,
      activeTab: 'edit',
    };
  },
  methods: {
    updateTab() {
      switch (this.activeTab) {
        case 'edit':
          this.editDisplay = true;
          this.testDisplay = false;
          this.historyDisplay = false;
          break;
        case 'test':
          this.editDisplay = false;
          this.testDisplay = true;
          this.historyDisplay = false;
          break;
        case 'history':
          this.editDisplay = false;
          this.testDisplay = false;
          this.historyDisplay = true;
          break;
        default:
          break;
      }
    },
    minWindow() {
      ipc.send('window-min');
    },
    closeWindow() {
      ipc.send('window-close');
    },
  },
};
</script>

<style scoped>
.home {
  height: 100%;
  width: 100%;
  position: relative;
}

.home /deep/ .el-tabs__content {
  height: 100%;
}

.el-header {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  padding: 0px;
}

.el-main {
  height:calc(100% - 70px);
  padding: 0px;
  background-color: #E9EEF3;
  color: #333;
}

.main-tab {
  height: 100%;
}

@font-face { /* Unicode  */
  font-family: 'iconfont';
  src: url('../assets/iconfont/iconfont.eot');
  src: url('../assets/iconfont/iconfont.eot?#iefix') format('embedded-opentype'),
    url('../assets/iconfont/iconfont.woff2') format('woff2'),
    url('../assets/iconfont/iconfont.woff') format('woff'),
    url('../assets/iconfont/iconfont.ttf') format('truetype'),
    url('../assets/iconfont/iconfont.svg#iconfont') format('svg');
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 1em;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon {
  width: 2em;
  height: 2em;
  fill: currentColor;
  overflow: hidden;
}

.logo {
  height: 58px;
  width: 90px;
  padding: 0px 38px;
}

.title {
  height: 60px;
  font-size: 30px;
  font-weight: 540;
  line-height: 60px;
  text-align: center;
}

.tab-label {
  font-size: 18px;
}

.home /deep/ .el-tabs__header {
  background-color: #D3DCE6;
}

.home /deep/ .el-tabs__item {
  height: 50px;
  padding: 8px 45px;
}

.el-main /deep/ .el-tab-pane {
  height: calc(100% - 20px);
  padding: 10px 0;
}

.el-row {
  margin-left: -20px;
  margin-right: -20px;
}

.window-icon {
  font-size: 30px;
  line-height: 60px;
  margin: 0px 5px;
}

.window-icon:hover {
  color: #409EFF;
}
</style>
