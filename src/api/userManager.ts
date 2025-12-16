import service from './myAxios'
import { SuccessInformation, ErrorInformation } from '~/components/notification'
import router from '../router/index'
import type { UserRegisterData, BackendResult } from '~/types/global.d.ts';

export async function userLogin(email: string, password: string, isFirst: boolean): Promise<void> {
    var data = {
        "email": email,
        "password": password,
        'isFirst': isFirst?"yes":"no"
    };
    
    try {
        const result = await service.post('/user/login', data, { withCredentials: true }) as BackendResult<string>;
        
        if (result.code === 0) {
            SuccessInformation(result.data as string); 
            router.push("/Home");
        } else {
            ErrorInformation(result.message);
        }
    } catch (error) {
        console.error('登陆失败:', error);
    }
}

export async function userRegister(email: string): Promise<void> {
    try{
    const data = { "email": email };
    const result = await service.post('/user/register', data, { withCredentials: true }) as BackendResult<string>;

    if (result.code === 0) {
        SuccessInformation(result.data as string);
        router.push("/Login?isFirst=1");
    } else {
        ErrorInformation(result.message);
    }
    } catch (error){
        console.log("注册失败:", error)
    }
}

export async function userSendEmail(email: string): Promise<number> {
    try {
        const data = { email: email };
        
        const result = await service.post('/user/sendEmail', data, { withCredentials: true }) as BackendResult<number>;
        if(result.code === 0){
            return result.data;
        }
        else{
            ErrorInformation(result.message)
        }
        
    } catch (error) {
        console.error('邮件发送失败', error);
    }
}

export async function userInfo(): Promise<UserRegisterData> {
    try {
        const result = await service.get('/user/userInfo', { withCredentials: true }) as BackendResult<UserRegisterData>;
        if(result.code === 0){
            return result.data;
        }
        else{
            ErrorInformation(result.message)
        }
    } catch (error) {
        console.error('用户信息获取失败', error);
    }
}

export async function userEditAvatar(avatarData: FormData): Promise<string> {
    try {
        const result = await service.post('/file/uploadAvatar', avatarData, { withCredentials: true }) as BackendResult<string>;
        if(result.code === 0){
            SuccessInformation('头像修改成功');
            return result.data;
        } else {
            ErrorInformation(result.message);
        }
    } catch (error) {
        console.error('头像修改失败', error);
    }
}
