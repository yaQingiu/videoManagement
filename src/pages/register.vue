<template>
            <el-row class="full-screen-row">
            <el-col id="titles" :lg="16" :xs="24">
                <div class="content">welcome</div>
                <div class="content" style="font-size: 30px;color: rgb(255, 255, 255, 0.7);">This is an online learning website, please register to learn</div>
            </el-col>
            <el-col id="information" :lg="8" :xs="24">
                <h2 id="welcome">Welcome new user!</h2>
                <div id="mainBlock">
                    <span id="start">Click to start</span>
                    <div id="formDiv">
                        <el-form
                            ref="ruleEmailRef"
                            :model="emailForm"
                            status-icon
                            :rules="emailRules"
                            label-width="auto"
                            class="demo-ruleForm"
                            v-show="isSend==0">
                            <el-form-item label="email" prop="email">
                                <el-input v-model="emailForm.email" type="email" placeholder="请输入邮箱">
                                <template #prefix>
                                    <el-icon class="el_input_icon"><Message /></el-icon>
                                </template> 
                                </el-input>
                            </el-form-item>
                            <div class="submit">
                                <el-button @click="sendEmail(ruleEmailRef)" :loading="loading" style="width: 80px; font-size: 15px; align-self:flex-end">验证邮箱</el-button>
                            </div>
                        </el-form>
                        <el-form
                            ref="vcFormRef"
                            :model="vcForm"
                            status-icon
                            :rules="vcRules"
                            label-width="auto"
                            class="demo-ruleForm"
                            v-show="isSend==1">
                            <el-text class="mx-1" size="large">email:{{ emailForm.email }}</el-text>
                            <el-form-item label="verification code" prop="vc">
                                <el-input v-model="vcForm.vc" autocomplete="off" placeholder="请输入验证码">
                                <template #prefix>
                                    <el-icon class="el_input_icon"><SuccessFilled /></el-icon>
                                </template> 
                                </el-input>
                            </el-form-item>
                            <div class="submit">
                                <el-button @click="submitForm(vcFormRef)" :loading="loading" style="width: 80px; font-size: 15px; align-self:flex-end">注册</el-button>
                            </div>
                        </el-form>
                        <span id="login" @click="loginTS()" style="padding-left: 400px; cursor: pointer;">>账号已存在?去登录</span>
                    </div>
                </div>
            </el-col>   
        </el-row>
</template>
<script lang="ts" setup>
    import {Message,SuccessFilled} from '@element-plus/icons-vue'
    import { reactive, ref } from 'vue'
    import type { FormInstance, FormRules} from 'element-plus'
    import { userRegister,userSendEmail } from '../api/userManager'; 
    import router from '../router/index'
    const isLogin=ref(false);
    const ruleEmailRef = ref<FormInstance>();
    const vcFormRef = ref<FormInstance>();
    const loading=ref(false);
    const vc=ref();
    const isSend=ref(0);


    const checkEmail = (rule: any, value: any, callback: any) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            return callback(new Error('Please input your email'));
        }
        if(!regex.test(value)){
            return callback(new Error('Not a legal email format'));}
        setTimeout(() => {
            callback()
        }, 1000)
    }

    const checkVc = (rule: any, value: any, callback: any) => {
        if (!value) {
            return callback(new Error('Please input your verification code'));
        }
        if (value!=vc.value){
            return callback(new Error('verification code is wrong!'));
        }
        setTimeout(() => {
            callback()
        }, 1000)
    }

    
    const emailForm = reactive({
        email:'',
    })

    const vcForm = reactive({
    vc: '',
    })

    const emailRules = reactive<FormRules<typeof emailForm>>({
    email: [{ validator: checkEmail, trigger: 'blur' }],
    })
    const vcRules = reactive<FormRules<typeof vcForm>>({
    vc: [{ validator: checkVc}],
    })

    const sendEmail = async (formEl: FormInstance | undefined) => {
        if (!formEl) {
            console.log('No email address');
            return;
        }

        const valid = await new Promise<boolean>((resolve) => {
            formEl.validate((isValid) => resolve(isValid));
        });

        if (!valid) {
            console.log('Error submit!');
            formEl.resetFields();
            return;
        }

        loading.value = true;
        try {
            const result = await userSendEmail(emailForm.email);
            vc.value = result;
            isSend.value = 1;
        } catch (error) {
            console.error('Send email failed:', error);
            isSend.value = 0;
        } finally {
            loading.value = false;
        }
    }

    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl){
            console.log('No information');
            return;
        }
        formEl.validate((valid) => {
            if (valid) {
                loading.value=true;
                try {
                    userRegister(emailForm.email);
                } catch (error) {
                }
                finally{
                    loading.value=false;
                }
            } 
            else {
            console.log('error submit!');
            formEl.resetFields();
            return;
            }
        })
    }

    const loginTS = () => {
        router.push("/Login");
    }

</script>

<style scoped>
.full-screen-row {
	width: 100vw;
    height: 100vh;
    padding: 0%;
    margin: 0%;
    background-image: url("../assets/pictures/background.jpg");
    background-color: rgb(230, 170, 195);
  }
#titles {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; 
    height: 100%;
    background-color: rgb(28, 62, 106, 0.6);
}
#information {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(255, 255, 255, 0.8);
    height: 100%;
}
.content {
    text-align: center;
    align-self: center;
    color: white;
    font-size: 60px;
}
#welcome {
    font-size: 40px;
    color: rgb(94, 94, 94);
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
}
#mainBlock {
    width: 80%;
    align-items: center;
    padding: 6px;
}
#start {
    font-size: 25px;
    color: rgb(94, 94, 94);
    text-align: center;
    padding-bottom: 20px;
}
#formDiv {
    width: 100%;
    align-items: center;
    padding-top: 20px;
}
el-input {
    width: 250px;
}
.submit {
    align-items: center;
}

#register {
    width: 120px;
    height: 40px;
    font-size: 10px;
    color: rgba(80, 80, 80, 0.8);
}
#login {
    width: 120px;
    height: 40px;
    font-size: 10px;
    color: rgba(80, 80, 80, 0.8);
}
.mx-1 {
    align-self:flex-end;
    padding-top: 30px;
    padding-bottom: 10px;
}

</style>