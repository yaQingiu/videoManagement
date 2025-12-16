export interface BackendResult<T> {
    code: number,
    message: string;
    data: T | null;
}
export interface UserRegisterData {
    id: number;
    username: string,
    password: string,
    nickname: string,
    email: string,
    userPic: string,
    createTime: string,
    updateTime: string
}
export interface VideoData {
    id: number;
    title: string,
    content: string,
    coverImg: string,
    state: string,
    categoryId: number,
    createUser: number,
    createTime: string,
    updateTime: string
}
export interface CategoryData {
    id: number;
    categoryName: string,
    createUser: number,
    createTime: string,
    updateTime: string
}
