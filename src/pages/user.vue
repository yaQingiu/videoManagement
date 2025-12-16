<template>
  <div class="top-bar">

    <div class="top-bar-info">
      <span class="welcome">你好&nbsp;{{ userInformation.nickname  || "新用户"}}</span>
        <span class="profile-info" @mouseenter="showInfo = true" @mouseleave="showInfo = false">
          用户信息
          <div v-if="showInfo" class="user-detail-info">
            <div>邮箱: {{ userInformation.email }}</div>
            <div>用户编号: {{ userInformation.id }}</div>
            <div>加入时间: {{ userInformation.createTime }}</div>
            <div>视频主题数: {{ categoryLength.totalCategories }}</div>
            <div>总视频数: {{ videoLength.totalVideos }}</div>
          </div>
      </span>·
    </div>

    <div class="video-info-container">
      <div class="video-info">
          <div class="video-info-item-label-total" :class="{ active: videoBlockChoice === 0 }" @click="videoBlockChoice = 0">我的所有视频</div>
          <div class="video-info-item-label-collect" :class="{ active: videoBlockChoice === 1 }" @click="videoBlockChoice = 1">我的收藏</div>
          <div class="video-info-item-label-recycle" :class="{ active: videoBlockChoice === 2 }" @click="videoBlockChoice = 2">我的回收站</div>
      </div>
      <img :src="userInformation.userPic" alt="头像" class="video-info-avatar" @click="chooseAvatar">
      <input type="file" ref="avatarInput" style="display:none" accept="image/*" @change="handleAvatarChange" />
    </div>
  </div>

  <!-- 全局 Loading 遮罩 -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
  </div>

  <!-- 错误提示 -->
  <div v-else-if="loadError" class="error-message">
    <el-icon><CircleClose /></el-icon>
    <p>{{ loadError }}</p>
    <el-button @click="retryLoad">重试</el-button>
  </div>

  <!-- 主体内容 -->
  <div v-else>
  <div v-show="videoBlockChoice == 0" style="display: flex; flex-direction: row;">
    <div class="video-category-nav">
      <div class="add-category">
        <el-icon @click="addCategory"><Plus /></el-icon>
        <el-dialog v-model="dialogCategoryFormVisible" title="请输入新类别名称" width="500" @close="handleCancelCategory">
          <el-form :model="addCategoryForm" label-position="top">
              <el-input v-model="addCategoryForm.name" autocomplete="off" />
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancelCategory">取消</el-button>
              <el-button type="primary" @click="submitCategory">
                确认
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
      <div class="video-category-nav-title">视频主题</div>
      <div class="video-category-list">
        <div v-for="([id, category], idx) in pagedCategories" :key="Number(id)"
             class="video-category-item"
             :class="{ 'selected-category': selectedCategoryId === Number(id) }"
             @click="selectCategory(Number(id))">
          {{ category }}
          <div class="category-icon-container">
            <el-icon class="ellipsis-icon" @click="toggleCategoryOptions(idx)">
              <More />
            </el-icon>
          </div>
          <div v-if="showCategoryOptionsIndex === idx" class="options-menu">
            <div class="option-item" @click="handleCategoryDelete(Number(id))">删除类别</div>
          </div>
        </div>
      </div>
      <div class="video-category-pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第{{ currentPage }}页 / 共{{ totalPages }}页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>
    <div class="video-category-content-display">
      <div class="content-area">
        <div class="video-show-area" v-if="selectedCategoryId !== null">
          <div class="video-show" v-if="videosByCategory[selectedCategoryId] && videosByCategory[selectedCategoryId].length">
            <div class="single-video" 
                 v-for="(v, idx) in videosByCategory[selectedCategoryId]" 
                 :key="idx">
              <div class="video-container">
                <video :src="v.url" controls style="max-width: 100%; height: auto; display:block" playsinline/>
                <div class="video-icon-container">
                  <el-icon
                    :class="v.state === '收藏' ? 'favorited' : ''"
                    class="star-icon"
                    @click="toggleVideoFavorite(v)"
                  >
                    <Star />
                  </el-icon>
                  <el-icon class="ellipsis-icon" @click="toggleVideoOptions(idx)">
                    <More />
                  </el-icon>
                </div>
                <div v-if="showVideoOptionsIndex === idx" class="options-menu">
                  <div class="option-item" @click="handleVideoDelete(v)">删除</div>
                </div>
              </div>
              <div style="font-weight: bold;">{{ v.title }}</div>
            </div>
          </div>
          <div v-else>
            <div style="color:#666; margin-top:30px">该主题下还没有视频，点击右侧“+”上传视频，一次只能上传一条视频。</div>
          </div>
        </div>
        <span v-else>点击左上方加号创建分区</span>
      </div>
      <div class="edit-content">
        <el-icon @click="searchVideo"><Search /></el-icon>
        <el-icon @click="addVideo"><Plus /></el-icon>
        <el-dialog v-model="dialogVideoFormVisible" title="请输入视频名称并选择类别分区" width="500" @close="handleCancelVideo">
          <el-form :model="addVideoForm" label-position="top">
            <el-form-item label="视频名称" :label-width="formLabelWidth">
              <el-input v-model="addVideoForm.name" autocomplete="off" />
            </el-form-item>
            <el-form-item label="类别分区" :label-width="formLabelWidth">
              <el-select v-model="addVideoForm.category" placeholder="请选择类别分区">
                <el-option
                  v-for="(name, id) in categoryIdToName"
                  :key="id"
                  :label="name"
                  :value="Number(id)"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancelVideo">取消</el-button>
              <el-button type="primary" @click="submitVideo">
                确认
              </el-button>
            </div>
          </template>
        </el-dialog>
        <el-icon @click="showStatistics"><Histogram /></el-icon>
        <input type="file" ref="fileInput" style="display:none" accept="video/*" @change="handleFileChange" />
      </div>
    </div>
  </div>
  <div v-show="videoBlockChoice == 1" style="display: flex; flex-direction: row;">
    <div class="content-area">
    <div class="video-show-area">
      <div class="video-show" v-if="collectBox && collectBox.length">
        <div class="single-video" 
              v-for="(v, idx) in collectBox" 
              :key="idx">
          <div class="video-container">
            <video :src="v.url" controls style="max-width: 100%; height: auto; display:block" playsinline/>
            <div class="video-icon-container">
              <el-icon
                :class="v.state === '收藏' ? 'favorited' : ''"
                class="star-icon"
                @click="toggleVideoFavorite(v)"
              >
                <Star />
              </el-icon>
              <el-icon class="ellipsis-icon" @click="toggleVideoOptions(idx)">
                <More />
              </el-icon>
            </div>
            <div v-if="showVideoOptionsIndex === idx" class="options-menu">
              <div class="option-item" @click="handleVideoDelete(v)">删除</div>
            </div>
          </div>
          <div style="font-weight: bold;">{{ v.title }}</div>
        </div>
      </div>
      <div v-else>
        <div style="color:#666; margin-top:30px">你还没有收藏视频，主页面视频缩略图右上角单击收藏即可查看所有收藏视频</div>
      </div>
    </div>
  </div>
  </div>
  <div v-show="videoBlockChoice == 2" style="display: flex; flex-direction: row;">
    <div class="content-area">
    <div class="video-show-area">
      <div class="video-show" v-if="recycleBin && recycleBin.length">
        <div class="single-video" 
              v-for="(v, idx) in recycleBin" 
              :key="idx">
          <div class="video-container">
            <video :src="v.url" controls style="max-width: 100%; height: auto; display:block" playsinline/>
            <div class="video-icon-container">
              <el-icon class="ellipsis-icon" @click="toggleVideoOptions(idx)">
                <More />
              </el-icon>
            </div>
            <div v-if="showVideoOptionsIndex === idx" class="options-menu">
              <div class="option-item" @click="handleVideoRecover(v)">恢复</div>
              <div class="option-item" @click="handleVideoDrop(v)">彻底删除</div>
            </div>
          </div>
          <div style="font-weight: bold;">{{ v.title }}</div>
        </div>
      </div>
      <div v-else>
        <div style="color:#666; margin-top:30px">回收站空空如也</div>
      </div>
    </div>
  </div>
</div>
<ProgressBar :progress="progress" :isVisible="isProgressVisible" />
</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Plus, Search, Histogram, CircleClose, Loading, Star, More } from '@element-plus/icons-vue';
import {uploadLargeFile} from '~/api/videoManager'
import { UploadCancelledError } from '~/compose/util';
import { SuccessInformation, ErrorInformation } from '~/components/notification';
import {storeToRefs} from 'pinia'
import {useVideoStore} from "~/store/videoStore"
import type { VideoData } from '~/types/global.d.ts';
import ProgressBar from '~/components/ProgressBar.vue';

const isLoading = ref(false);
const loadError = ref('');
const showInfo = ref(false);
const dialogVideoFormVisible = ref(false);
const dialogCategoryFormVisible = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);
const addVideoForm = ref({
  name: '',
  category: 0
});
export type VideoForm = {
  name: string;
  category: number;
};
const addCategoryForm = ref({
  name: ''
});
const videoBlockChoice = ref<number>(0);
const formLabelWidth = '120px';
const progress = ref<number>(0);
const isProgressVisible = ref(false);


const videoStore = useVideoStore();
const { 
  userInformation, 
  videoLength, 
  categoryLength,
  videosByCategory,
  categoryIdToName,
  recycleBin,
  collectBox,
} = storeToRefs(videoStore);

const pageSize: number = 8;
const currentPage = ref<number>(1);
const totalPages = computed(() => Math.ceil(Object.keys(categoryIdToName.value).length / pageSize));
const startIndex = computed(() => (currentPage.value - 1) * pageSize);

const pagedCategories = computed(() => {
  return Object.entries(categoryIdToName.value).slice(startIndex.value, startIndex.value + pageSize);
});

const selectedCategoryId = ref<number | null>(Object.keys(categoryIdToName.value).length > 0 ? Number(Object.keys(categoryIdToName.value)[0]) : null);

function retryLoad() {
  isLoading.value = true;
  loadError.value = '';
  
  videoStore.fetchAllData()
    .then(() => videoStore.fetchUserInfo())
    .catch((error) => {
      console.error('数据加载失败:', error);
      loadError.value = '数据加载失败，请刷新页面重试';
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function selectCategory(id: number) {
  selectedCategoryId.value = id;
}

let resolveVideoDialog: ((value: boolean) => void) | null = null;
let resolveCategoryDialog: ((value: boolean) => void) | null = null;
let rejectVideoDialog: ((reason?: any) => void) | null = null;
let rejectCategoryDialog: ((reason?: any) => void) | null = null;

function getDefaultCategoryId(): number {
  return selectedCategoryId.value || 0;
}

const setProgress = (value: number) => {
  progress.value = value;
};

const showProgress = () => {
  isProgressVisible.value = true;
};

const hideProgress = () => {
  isProgressVisible.value = false;
};

function addVideo() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    addVideoForm.value = { 
      name: '', 
      category: getDefaultCategoryId() 
    };
    
    dialogVideoFormVisible.value = true;
    await new Promise((resolve, reject) => {
      resolveVideoDialog = resolve;
      rejectVideoDialog = reject;
    });
    if (!addVideoForm.value.name || addVideoForm.value.category === 0) {
      input.value = ''
      console.warn('用户未选择类别或未填写完整信息')
      return
    }
    setProgress(0);
    showProgress();
    const video: VideoData = await uploadLargeFile(file, addVideoForm.value, setProgress);
    await videoStore.AddVideo(video);
    SuccessInformation('视频上传成功')
  } catch (err) {
    if (err instanceof UploadCancelledError){
    console.log('用户取消上传')
    SuccessInformation('用户取消上传')
    }else {
      console.error('上传失败：', err);
      ErrorInformation('视频上传失败');
    }
  } finally {
    hideProgress();
    if (fileInput.value) fileInput.value.value = ''
    dialogVideoFormVisible.value = false;
    resolveVideoDialog = null;
    rejectVideoDialog = null;
  }
}

const submitVideo = () => {
  if (!addVideoForm.value.name.trim()) {
    ErrorInformation('请输入视频标题'); 
    return; 
  }

  dialogVideoFormVisible.value = false; 
  if (resolveVideoDialog) {
    resolveVideoDialog(true);
  }
};

const handleCancelVideo = () => {
  dialogVideoFormVisible.value = false;
  
  if (rejectVideoDialog) {
    rejectVideoDialog(new UploadCancelledError('cancel'));
  }
};

async function addCategory() {
  try{
    dialogCategoryFormVisible.value = true;
    await new Promise((resolve, reject) => {
      resolveCategoryDialog = resolve;
      rejectCategoryDialog = reject;
    });
    if (!addCategoryForm.value.name.trim()) {
      return
    }
    const categoryId = await videoStore.addCategory(addCategoryForm.value.name)
    SuccessInformation('视频主题添加成功')
    console.log('视频主题添加成功：', categoryId)
  } catch (err) {
    if (err instanceof UploadCancelledError){
    console.log('用户取消添加视频主题')
    SuccessInformation('用户取消添加视频主题')
    }else {
      console.error('添加失败：', err);
      ErrorInformation('视频主题添加失败');
  }
}
 finally {
    dialogCategoryFormVisible.value = false;
    resolveCategoryDialog = null;
    rejectCategoryDialog = null;
    addCategoryForm.value.name = '';
}
}

const submitCategory = () => {
  if (!addCategoryForm.value.name.trim()) {
    ErrorInformation('请输入视频主题名称'); 
    return; 
  }

  dialogCategoryFormVisible.value = false; 
  if (resolveCategoryDialog) {
    resolveCategoryDialog(true);
  }
};

const handleCancelCategory = () => {
  dialogCategoryFormVisible.value = false;
  
  if (rejectCategoryDialog) {
    rejectCategoryDialog(new UploadCancelledError('cancel'));
  }
};

function searchVideo() {
  console.log('搜索视频');
}
function showStatistics() {
  console.log('显示统计信息');
}

const showVideoOptionsIndex = ref<number | null>(null);
const showCategoryOptionsIndex = ref<number | null>(null);

async function toggleVideoFavorite(video: any) {
  if(video.state === '默认'){
    try{
    console.log('收藏', video.id);
    await videoStore.collectVideo(video.id, video.categoryId);
    }
    catch(err){
      ErrorInformation('收藏视频失败');
    }
  }
  else if(video.state === '收藏'){
    try{
    console.log('取消收藏', video.id);
    await videoStore.cancelCollectVideo(video.id, video.categoryId);
    }
    catch(err){
      ErrorInformation('取消收藏视频失败');
    }
  }
}

function toggleVideoOptions(index: number) {
  showVideoOptionsIndex.value = showVideoOptionsIndex.value === index ? null : index;
}

function toggleCategoryOptions(index: number) {
  showCategoryOptionsIndex.value = showCategoryOptionsIndex.value === index ? null : index;
}

async function handleVideoDelete(video: any) {
  try{
    console.log('删除', video.id);
    await videoStore.deleteVideo(video.id,video.categoryId);
  }
  catch(err){
    ErrorInformation('未选择视频主题，无法删除视频');
  }
  showVideoOptionsIndex.value = null;
}

async function handleVideoRecover(video: any) {
  console.log('恢复', video.id);
  await videoStore.recoverVideo(video.id, video.categoryId);
  showVideoOptionsIndex.value = null;
}

async function handleVideoDrop(video: any) {
  console.log('彻底删除', video.id);
  await videoStore.dropVideo(video.id, video.categoryId);
  showVideoOptionsIndex.value = null;
}

async function handleCategoryDelete(categoryId: number) {
  console.log('删除类别', categoryId);
  await videoStore.deleteCategory(categoryId);
  showCategoryOptionsIndex.value = null;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.options-menu') && !target.closest('.ellipsis-icon')) {
    showVideoOptionsIndex.value = null;
    showCategoryOptionsIndex.value = null;
  }
}

onMounted(
  async () => {
  document.addEventListener('click', handleClickOutside);
  isLoading.value = true;
  loadError.value = '';
  
  try {
    await Promise.all([
      videoStore.fetchAllData(),
      videoStore.fetchUserInfo()
    ]);
  } catch (error) {
    console.error('数据加载失败:', error);
    loadError.value = '数据加载失败，请刷新页面重试';
  } finally {
    isLoading.value = false;
  }
}
);
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

function chooseAvatar() {
  avatarInput.value?.click();
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    await videoStore.editAvatar(file);
    SuccessInformation('头像修改成功');
  } catch (err) {
    console.error('头像修改失败:', err);
  } finally {
    if (avatarInput.value) avatarInput.value.value = '';
  }
}

</script>

<style scoped>
.top-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: rgb(173, 214, 244); */
  background-image: url('../assets/pictures/sky.jpg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  height: 30%;
}
.top-bar-info {
  margin-top: 10px;
  align-self: flex-end;
}
.video-info-container {
  display: flex;
  align-items: center;
  margin-top: 182px;
}
.video-info {
  display: flex;
  align-items: center;
  margin-top: 50px;
}
.video-info>div{
  cursor: pointer;
}
.welcome {
  color: rgb(255, 255, 255);
  font-size: 13px;
  margin-right: 24px;
}
.profile-info {
  color: rgb(255, 255, 255);
  padding: 6px 18px;
  margin-right: 20px;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.2s;
  position: relative;
  cursor: pointer;
}
.user-detail-info {
  position: absolute;
  top: 100%;
  left: 100%;
  transform: translateX(-100%);
  background: #fff;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 12px 20px;
  z-index: 10;
  min-width: 200px;
  max-width: 90vw; /* 防止超出视口 */
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
  text-align: left;
}
.video-info-item-label-total:hover, .video-info-item-label-collect:hover, .video-info-item-label-recycle:hover {
  background-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(75, 107, 123, 0.08);
}
.video-info-item-label-total, .video-info-item-label-collect, .video-info-item-label-recycle {
  width: 200px;
  height: 30px;
  padding-top: 10px;
}
.video-info-item-label-total.active, .video-info-item-label-collect.active, .video-info-item-label-recycle.active {
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(75, 107, 123, 0.2);
}
.video-info-avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  margin-right: 20px;
  margin-left: auto;
  cursor: pointer;
}
.video-category-nav {
  width: 300px;
  margin: 120px 10px 10px 10px;
}
.video-category-nav-title {
  font-size: 15px;
  color: #222;
  background-color: rgb(129, 166, 192);
  padding: 10px 10px;
  border-radius: 5px;
}
.video-category-list {                                               
  display: flex;                                          
  flex-direction: column;
}
.video-category-item {
  position: relative;
  padding: 8px 16px;
  border-bottom: 1px solid rgb(129, 166, 192);
  font-size: 15px;
  color: #222;
  cursor: pointer;
}
.video-category-item:last-child {
  border-bottom: none;
}
.video-category-item.selected-category {
  background-color: rgb(217, 217, 217);
}
.video-category-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  font-size: 14px;
}
.video-category-pagination button {
  margin: 0 8px;
  padding: 2px 10px;
  border: 1px solid #000;
  background: none;
  color: #222;
  border-radius: 3px;
  cursor: pointer;
}
.video-category-pagination button:disabled {
  color: #aaa;
  border-color: #aaa;
  cursor: not-allowed;
}
.video-category-content-display {
  margin-left: 30px;
  margin-top: 30px;
  padding: 20px 30px;
  min-width: 1600px;
  min-height: 600px;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  box-shadow: 8px 8px 8px 8px rgba(0,0,0,0.04);
}
.content-area {
  width: 97%;
  height:100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.content-area .video-show-area .video-show {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;
  overflow-y: auto;
  flex-wrap: wrap;
}

.content-area .video-show-area .video-show .single-video {
  position: relative;
  margin: 15px 15px;
  min-width: 250px;
  max-width: 350px;
}

.video-category-content-display .edit-content {
  width: auto;
  height:100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.video-category-content-display .edit-content .el-icon {
  font-size: 40px;
  color: #6e6e6e;
  margin: 20px 0;
  cursor: pointer;
}
.video-category-content-display .edit-content .el-icon:hover {
  color: #000000;
  transition: all 0.3s;
}
.video-category-nav .add-category {
  font-size: 40px;
  color: #6e6e6e;
  margin: 10px auto;
  cursor: pointer;
}
.avatar-container {
  position: relative;
  display: inline-block;
}

.icon-container {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.star-icon {
  font-size: 20px;
  color: gray;
  cursor: pointer;
  fill: none;
}

.star-icon.favorited {
  color: yellow;
  fill: yellow;
}

.ellipsis-icon {
  font-size: 20px;
  color: gray;
  cursor: pointer;
}

.options-menu {
  position: absolute;
  top: 5px;
  right: 5px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.option-item {
  align-self: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #f0f0f0;
}

.video-container {
  position: relative;
  display: inline-block;
}

.video-icon-container {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.category-icon-container {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>