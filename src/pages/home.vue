<template>

  <div class="top-bar">
    <span class="welcome">你好,{{ userInformation.nickname  || "新用户"}}</span>
    <RouterLink class="profile-link" to="/User">用户主页</RouterLink>
  </div>
  <div class="main-content">
    <el-menu
      class="custom-menu"
      :default-active="activeIndex"
      style="height: 500px; width: 250px;"
      background-color="#fff"
      text-color="rgb(50,50,50)"
      active-text-color="rgb(173,214,244)"
      :router="false"
      mode="vertical"
      @select="handleMenuSelect"
    >
      <el-menu-item index="1">开始录制</el-menu-item>
      <el-menu-item index="2">设备选型</el-menu-item>
      <el-menu-item index="3">参数信息</el-menu-item>
      <el-menu-item index="4">内容分析</el-menu-item>
      <el-menu-item index="5">可视化</el-menu-item>
    </el-menu>
    <div class="main-content-center">
      <Begin v-if="activeIndex === '1'" />
      <Equipments v-if="activeIndex === '2'" />
      <Params v-if="activeIndex === '3'" />
      <Analysis v-if="activeIndex === '4'" />
      <Vision v-if="activeIndex === '5'" />
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ElMenu, ElMenuItem } from 'element-plus';
import Begin from './begin.vue';
import Equipments from './equipments.vue';
import Params from './params.vue';
import Analysis from './analysis.vue';
import Vision from './vision.vue';
import {storeToRefs} from 'pinia'
import {useVideoStore} from "~/store/videoStore"
const activeIndex = ref('1');
const handleMenuSelect = (index) => {
  activeIndex.value = index;
};
const videoStore = useVideoStore();
const { 
  userInformation
} = storeToRefs(videoStore);
</script>

<style scoped>
.top-bar {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: rgb(173, 214, 244);
  border-radius: 0 0 12px 12px;
  margin-bottom: 32px;
}
.welcome {
  color: rgb(50, 50, 50);
  font-size: 13px;
  margin-right: 24px;
}
.profile-link {
  color: rgb(50, 50, 50);
  padding: 6px 18px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.2s;
}
.profile-link:hover {
  background: rgb(111, 149, 177);
}
.main-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 10px;
  height: 97%;
  width: 100%;
}
.custom-menu {
  width: 150px !important;
  height: 280px !important;
  background: #fff !important;
  border-radius: 0 !important;
  color: rgb(50, 50, 50) !important;
  margin-right: 40px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.custom-menu .el-menu-item {
  text-align: center;
  border-radius: 0 !important;
  font-size: 16px;
  color: rgb(50, 50, 50) !important;
}
.custom-menu .el-menu-item.is-active {
  background: rgb(173, 214, 244) !important;
  color: rgb(50, 50, 50) !important;
}
.main-content-center {
  flex: 1;
  text-align: center;
  height: 100%;
  color: #333;
}
.main-content-center h1 {
  color: rgb(173, 214, 244);
  font-size: 32px;
  margin-bottom: 12px;
}
</style>