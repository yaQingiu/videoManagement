import { defineStore } from 'pinia'
import { ref} from 'vue';
import {videoListService, deleteVideoService, recoverVideoService, dropVideoService, collectVideoService, cancelCollectVideoService} from "~/api/videoManager";
import {addCategoryService, deleteCategoryService, categoryService} from "~/api/categoryManager";
import { userInfo, userEditAvatar} from '~/api/userManager';
import { ErrorInformation} from '~/components/notification'
import defaultAvatar from '~/assets/defaultAvatar/default.png'
import type { VideoData } from '~/types/global.d.ts';

type VideoItem = {id:number, 
                  title: string; 
                  url: string; 
                  state: string;
                  categoryId: number};
type VideoMap = Record<number, VideoItem[]>;
interface UserInfoState {
  id: number | string;
  email: string;
  nickname: string;
  createTime: string;
  userPic: string
}


export const useVideoStore = defineStore('video', () => {
  const videosByCategory = ref<VideoMap>({});
  const categoryIdToName = ref<Record<number, string>>({});
  const userInformation = ref<UserInfoState>({
    id: '',
    email: '',
    nickname: '',
    createTime: '',
    userPic: ''
  });
  const videoLength = ref({ totalVideos: 0 });
  const categoryLength = ref({ totalCategories: 0 });
  const recycleBin = ref<VideoItem[]>([]);
  const collectBox = ref<VideoItem[]>([]);

  const fetchUserInfo = async () => {
    try {
      const response = await userInfo();
      
      userInformation.value = {
        id: response.id || '',
        email: response.email || '',
        nickname: response.nickname || '新用户',
        createTime: response.createTime || '',
        userPic: response.userPic.length > 0 ? response.userPic : defaultAvatar
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const fetchAllData = async () => {
    try {

      const [videoRes, catRes] = await Promise.all([
        videoListService(), 
        categoryService()
      ]);

      const newCatMapIdToName: Record<number, string> = {};
      catRes.forEach((c: any) => {
        newCatMapIdToName[c.id] = c.categoryName;
      });
      categoryIdToName.value = newCatMapIdToName;

      const newVideoMap: VideoMap = {};
      collectBox.value = [];
      recycleBin.value = [];
      videoRes.forEach((v: any) => {
        const catId = v.categoryId || 0;
        if(catId !== 0){
          if (!newVideoMap[catId]) newVideoMap[catId] = [];
          if (v.state !== '删除') {
          newVideoMap[catId].push({
            id: v.id,
            title: v.title,
            url: v.content,
            state: v.state,
            categoryId: catId
          });
            if (v.state === '收藏') {
              collectBox.value.push({
                id: v.id,
                title: v.title,
                url: v.content,
                state: v.state,
                categoryId: catId
              });
            }
          } else {
            recycleBin.value.push({
              id: v.id,
              title: v.title,
              url: v.content,
              state: v.state,
              categoryId: catId
            });
          }
        }
      });
      videosByCategory.value = newVideoMap;

      videoLength.value.totalVideos = videoRes.length-recycleBin.value.length;
      categoryLength.value.totalCategories = catRes.length;
    } catch (e) {
      console.error('后台静默刷新数据失败', e);
    }
  };

  const editAvatar = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    try {
      const response = await userEditAvatar(form);
      if(response.length > 0){
        userInformation.value.userPic = response;
        console.log('修改头像成功:', response);
      }
      else{
        console.error('修改头像失败: 返回的头像URL为空');
      }
    } catch (error) {
      console.error('修改头像失败:', error);
    }
  };

  const AddVideo = async (video: VideoData): Promise<void> => {
    try {
    console.log('准备添加视频:', video);

    let id = video.id || 0;
    let title = video.title || '未命名视频';
    let url = video.content || '';
    let state = video.state || '默认';
    let categoryId = video.categoryId || 0;

    if (!videosByCategory.value[categoryId]) {
      videosByCategory.value[categoryId] = [];
    }
    
    videosByCategory.value[categoryId].push({
      id: id,
      title: title,
      url: url,
      state: state,
      categoryId: categoryId
    });

    videoLength.value.totalVideos++;
    } catch (error) {
      console.error('上传视频失败:', error);
    }
  };

  const deleteVideo = async (videoId: number, categoryId: number) => {
    const response = await deleteVideoService(videoId, categoryId);
    
    if (videosByCategory.value[categoryId]) {
      const index = videosByCategory.value[categoryId].findIndex(v => v.id === videoId);
      if(index !== -1) {
        videosByCategory.value[categoryId][index].state="删除"
        videoLength.value.totalVideos--;
        recycleBin.value.push(videosByCategory.value[categoryId][index]);
        videosByCategory.value[categoryId].splice(index, 1);
      }
      else {
        console.warn(`视频ID ${videoId} 在分类ID ${categoryId} 中未找到`);
      }
    }
    return response;
  };

  const recoverVideo = async (videoId: number, categoryId: number) => {
    const response = await recoverVideoService(videoId, categoryId);
    const index = recycleBin.value.findIndex(item => item.id === videoId);
    if(index !== -1) {
    if (!videosByCategory.value[categoryId]) {
      videosByCategory.value[categoryId] = [];
    };
    videosByCategory.value[categoryId].push({
          id: videoId,
          title: recycleBin.value[index].title,
          url: recycleBin.value[index].url,
          state: '默认',
          categoryId: categoryId
        });
      recycleBin.value.splice(index, 1);
      videoLength.value.totalVideos++;
    }
    return response;
  };

  const dropVideo = async (videoId: number, categoryId: number) => {
    const response = await dropVideoService(videoId, categoryId);
    const index = recycleBin.value.findIndex(item => item.id === videoId);
    if(index !== -1) {
      recycleBin.value.splice(index, 1);
    }
    return response;
  };

  const collectVideo = async (videoId: number, categoryId: number) => {
    const response = await collectVideoService(videoId, categoryId);
    if (videosByCategory.value[categoryId]) {
      const index = videosByCategory.value[categoryId].findIndex(v => v.id === videoId);
      if(index !== -1) {
        videosByCategory.value[categoryId][index].state="收藏"
        collectBox.value.push(videosByCategory.value[categoryId][index]);
      }
      else {
        console.warn(`视频ID ${videoId} 在分类ID ${categoryId} 中未找到`);
      }
    }
    return response;
  };

  const cancelCollectVideo = async (videoId: number, categoryId: number) => {
    const response = await cancelCollectVideoService(videoId, categoryId);
    if (videosByCategory.value[categoryId]) {
      const index = videosByCategory.value[categoryId].findIndex(v => v.id === videoId);
      if(index !== -1) {
        videosByCategory.value[categoryId][index].state="默认"
        const collectIndex = collectBox.value.findIndex(v => v.id === videoId);
        if(collectIndex !== -1){
          collectBox.value.splice(collectIndex, 1);
        }
      }
      else {
        console.warn(`视频ID ${videoId} 在分类ID ${categoryId} 中未找到`);
      }
    }
    return response;
  };

  const addCategory = async (categoryName: string) => {
    const response = await addCategoryService(categoryName);
    
    const newCategoryId = response || 0;
    if (!newCategoryId) {
      ErrorInformation('视频主题添加失败');
      throw new Error('Invalid category ID returned from server');
    }
    categoryIdToName.value[newCategoryId] = categoryName;
    categoryLength.value.totalCategories++;
    return newCategoryId;
  };

  const deleteCategory = async (categoryId: number) => {
    const response = await deleteCategoryService(categoryId);
    
    delete categoryIdToName.value[categoryId];
    let numVideos = videosByCategory.value[categoryId]?.length || 0;
    delete videosByCategory.value[categoryId];
    categoryLength.value.totalCategories--;
    videoLength.value.totalVideos -= numVideos;
    return response;
  };

  return {
    videosByCategory,
    categoryIdToName,
    videoLength,
    categoryLength,
    userInformation,
    recycleBin,
    collectBox,
    fetchAllData,
    fetchUserInfo,
    editAvatar,
    AddVideo,
    deleteVideo,
    recoverVideo,
    dropVideo,
    collectVideo,
    cancelCollectVideo,
    addCategory,
    deleteCategory
  };
}, {
  persist: {
  key: 'user_videos_cache',
  storage: localStorage
}});