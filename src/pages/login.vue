<template>
    <el-row class="full-screen-row">
    <el-col id="titles" :lg="16" :xs="24">
        <div class="content">welcome</div>
        <div class="content" style="font-size: 30px;color: rgb(255, 255, 255, 0.7);">This is an online learning website</div>
    </el-col>
    <el-col id="information" :lg="8" :xs="24">
        <h2 id="welcome">Welcome new user!</h2>
        <div id="mainBlock">
            <span id="start">Click to start</span>
            <div id="formDiv">
                <el-form
                    ref="ruleEmailRef"
                    :model="EmailForm"
                    status-icon
                    :rules="EmailRules"
                    label-width="auto"
                    class="demo-ruleForm"
                    v-show="!isFirst">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="EmailForm.email" type="email" placeholder="请输入邮箱">
                        <template #prefix>
                            <el-icon class="el_input_icon"><Message /></el-icon>
                        </template> 
                        </el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="EmailForm.password" type="password" placeholder="请输入密码">
                        <template #prefix>
                            <el-icon class="el_input_icon"><Lock /></el-icon>
                        </template> 
                        </el-input>
                    </el-form-item>
                    <div class="submit">
                        <el-button @click="login(ruleEmailRef)" :loading="loading" style="width: 80px; font-size: 15px; align-self:flex-end">登录</el-button>
                    </div>
                </el-form>
                <el-form
                    ref="ruleEmailRefFirstLogin"
                    :model="FirstLoginEmailForm"
                    status-icon
                    :rules="FirstLoginEmailRules"
                    label-width="auto"
                    class="demo-ruleForm"
                    v-show="isFirst">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="FirstLoginEmailForm.email" type="email" placeholder="请输入邮箱">
                        <template #prefix>
                            <el-icon class="el_input_icon"><Message /></el-icon>
                        </template> 
                        </el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="FirstLoginEmailForm.password" type="password" placeholder="请设置密码">
                        <template #prefix>
                            <el-icon class="el_input_icon"><Lock /></el-icon>
                        </template> 
                        </el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="password">
                        <el-input v-model="FirstLoginEmailForm.rePassword" type="password" placeholder="请确认密码">
                        <template #prefix>
                            <el-icon class="el_input_icon"><Lock /></el-icon>
                        </template> 
                        </el-input>
                    </el-form-item>
                    <div class="submit">
                        <el-button @click="FirstLogin(ruleEmailRefFirstLogin)" :loading="loading" style="width: 80px; font-size: 15px; align-self:flex-end">登录</el-button>
                    </div>
                </el-form>
                <span id="register" @click="registerTS()" style="padding-left: 400px; cursor: pointer;">>账号不存在?去注册</span>
            </div>
        </div>
    </el-col>   
</el-row>
</template>
<script lang="ts" setup>
import {Message,Lock} from '@element-plus/icons-vue'
import { reactive, ref, onMounted} from 'vue'
import type { FormInstance, FormRules} from 'element-plus'
import { userLogin } from '../api/userManager'; 
import router from '../router/index'
import {ErrorInformation} from '../components/notification'
import { useRoute } from 'vue-router';
const route = useRoute();

const ruleEmailRef = ref<FormInstance>();
const ruleEmailRefFirstLogin = ref<FormInstance>();
const loading=ref(false);
const isFirst = ref(0);


onMounted(() => {
  const param = route.query.isFirst;
  if (param !== undefined) {
    isFirst.value = Number(param);
  }
});


const checkEmail = (rule: any, value: any, callback: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
    return callback(new Error('Please input your email'));
    }
    if(!regex.test(value))
    return callback(new Error('Not a legal email format'));
    setTimeout(() => {
    callback()
    }, 1000)
}

const checkPass = (rule: any, value: any, callback: any) => {
    if (!value) {
    return callback(new Error('Please input password'));
    }
    else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
    } 
    else {
    callback()
  }
}

const checkRePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== FirstLoginEmailForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
}

const EmailForm = reactive({
    email:'',
    password:''
})

const FirstLoginEmailForm = reactive({
    email:'',
    password:'',
    rePassword:''
})


const EmailRules = reactive<FormRules<typeof EmailForm>>({
email: [{ validator: checkEmail, trigger: 'blur' }],
password: [{ validator: checkPass, trigger: 'blur' }],
})

const FirstLoginEmailRules = reactive<FormRules<typeof FirstLoginEmailForm>>({
email: [{ validator: checkEmail, trigger: 'blur' }],
password: [{ validator: checkPass, trigger: 'blur' }],
rePassword: [{ validator: checkRePass, trigger: 'blur' }]
})


const login = (formEl: FormInstance | undefined) => {
    if (!formEl) {
    console.log("no email address");
    return;
    }
    formEl.validate((valid) => {
    if (valid) {
        loading.value=true;
        try {
            userLogin(EmailForm.email, EmailForm.password, false);
        } catch (error) {
            console.log(error);
        }
        finally{
            loading.value=false;
        }
    } 
    else {
    ErrorInformation('提交失败!请检查格式');
    formEl.resetFields();
    }
    })
}

const FirstLogin = (formEl: FormInstance | undefined) => {
    if (!formEl) {console.log("no email address");
    return;
    }
    formEl.validate((valid) => {
    if (valid) {
        loading.value=true;
        try {
            userLogin(FirstLoginEmailForm.email,FirstLoginEmailForm.password, true);
        } catch (error) {
        }
        finally{
            loading.value=false;
        }
    } 
    else {
    ErrorInformation('提交失败!请检查格式');
    formEl.resetFields();
    }
    })
    }

    const registerTS = () => {
        router.push("/Reg");
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