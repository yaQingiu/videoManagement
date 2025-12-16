import service from './myAxios'
import type { CategoryData, BackendResult } from '~/types/global.d.ts';
import { ErrorInformation } from '~/components/notification'
export async function categoryService() :Promise<CategoryData[]>{
    try {
        const result = await service.get('/category/list', {
            withCredentials: true
        }) as BackendResult<CategoryData[]>;
        if(result.code === 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('刷新视频类别数据失败:', error)
        throw error
    }
}

export async function addCategoryService(categoryName: string) :Promise<number>{
    try {
        const result = await service.post('/category/add', { 
        name: categoryName
        }, {
            withCredentials: true
        }) as BackendResult<number>;
        if(result.code === 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('添加类别失败:', error)
        throw error
    }
}

export async function deleteCategoryService(categoryId: number) :Promise<string> {
    try {
        const result = await service.put('/category/delete', categoryId, {
            withCredentials: true
        }) as BackendResult<string>;
        if(result.code === 0){
            return result.data
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('删除类别失败:', error)
        throw error
    }
}