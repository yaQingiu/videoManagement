import service from './myAxios'
import CryptoJS from 'crypto-js';
import type { VideoData, BackendResult } from '~/types/global.d.ts';
import { ErrorInformation } from '~/components/notification'
import type {VideoForm} from '~/pages/user.vue'
export async function uploadVideo(videoData: FormData): Promise<VideoData> {
    try {
        const result = await service.post('/file/uploadVideo', videoData, {
            withCredentials: true
        }) as BackendResult<VideoData>;
        if(result.code === 0){
            return result.data as VideoData
        }
        else {
            ErrorInformation(result.message);
        }
    } catch (error) {
        console.error('视频上传失败:', error)
        throw error
    }
}

export async function videoListService(): Promise<VideoData[]> {
    try {
        const result = await service.get('/video/list', {
            withCredentials: true
        }) as BackendResult<VideoData[]>;
        if(result.code === 0){
            return result.data as VideoData[]
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('后台刷新视频数据失败:', error)
        throw error
    }
}

export async function deleteVideoService(videoId: number, categoryId: number): Promise<string> {
    try {
        const result = await service.get('/video/delete', {
                params: { 
                    videoId: videoId,
                    categoryId: categoryId
                },
                withCredentials: true 
            }) as BackendResult<string>;
        if(result.code == 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('删除视频失败:', error)
        throw error
    }
}

export async function recoverVideoService(videoId: number, categoryId: number): Promise<string> {
    try {
        const result = await service.get('/video/recover', {
                params: {
                    videoId: videoId,
                    categoryId: categoryId
                },
                withCredentials: true 
            }) as BackendResult<string>;
        if(result.code == 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('恢复视频失败:', error)
        throw error
    }
}

export async function dropVideoService(videoId: number, categoryId: number): Promise<string> {
    try {
        const result = await service.delete('/video/drop', {
            params: {
                videoId: videoId,
                categoryId: categoryId
            },
            withCredentials: true
        }) as BackendResult<string>;
        if(result.code == 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('彻底删除视频失败:', error)
        throw error
    }
}

export async function collectVideoService(videoId: number, categoryId: number): Promise<string> {
    try {
        const result = await service.get('/video/collect', {
                params: { 
                    videoId: videoId,
                    categoryId: categoryId
                },
                withCredentials: true 
            }) as BackendResult<string>;
        if(result.code == 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('收藏视频失败:', error)
        throw error
    }
}

export async function cancelCollectVideoService(videoId: number, categoryId: number): Promise<string> {
    try {
        const result = await service.get('/video/cancelCollect', {
                params: {
                    videoId: videoId,
                    categoryId: categoryId
                },
                withCredentials: true 
            }) as BackendResult<string>;
        if(result.code == 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('取消收藏视频失败:', error)
        throw error
    }
}

async function calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve) => {
        const chunkSize = 10 * 1024 * 1024;
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const algo = CryptoJS.algo.MD5.create();
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
            if (e.target?.result) {
                const wordArray = CryptoJS.lib.WordArray.create(e.target.result as any);
                algo.update(wordArray);
            }
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve(algo.finalize().toString());
            }
        };

        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            fileReader.readAsArrayBuffer(file.slice(start, end));
        }

        loadNext();
    });
}

export async function initiateUpload(fileName: string, fileHash: string): Promise<{ uploadId: string, uploadedChunks: number[] }> {
 try {
    const result = await service.post('/file/uploadVideoInit', { fileName, fileHash }, { withCredentials: true }) as BackendResult<any>;
    if(result.code == 0){
        return result.data
    }
    else{
        ErrorInformation(result.message)
    }
    } catch (error) {
        console.error('初始化上传失败:', error)
        throw error
    }
}

export async function uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('chunk', chunk);

    const result = await service.post('/file/uploadVideoChunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
        withCredentials: true,
    }) as BackendResult<string>;
    if (result.code !== 0) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(`上传分片 ${chunkIndex} 失败:`, error);
    throw new Error(`上传分片 ${chunkIndex} 失败`);
  }
}

export async function completeUpload(uploadId: string, videoForm: VideoForm, fileName: string): Promise<VideoData> {
  try {
    const result = await service.post('/file/uploadVideoComplete', { uploadId : uploadId, ...videoForm, fileName: fileName }, { withCredentials: true }) as BackendResult<VideoData>;
    return result.data;
  } catch (error) {
    console.error('完成上传失败:', error);
    throw new Error('完成上传失败');
  }
}

export async function uploadLargeFile(file: File, videoForm: VideoForm, onProgress: (progress: number) => void): Promise<VideoData> {
  const chunkSize = 10 * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  const fileHash = await calculateFileHash(file);

  const { uploadId, uploadedChunks } = await initiateUpload(file.name, fileHash); 

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    if (uploadedChunks && uploadedChunks.includes(chunkIndex)) {
        onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
        continue;
    }

    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    await uploadChunk(uploadId, chunkIndex, chunk);
    onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
  }

  const video = await completeUpload(uploadId, videoForm, file.name);
  return video;
}