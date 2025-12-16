import router from "../router/index";
import {ErrorInformation} from "../components/notification"
import axios from '../api/myAxios'

async function checkAuth() {
    try {
        const response = await axios.get('/token/check', { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('check token fails:', error);
        return false;
    }
}

router.beforeEach(async (to, from, next) => {
    const token = await checkAuth();

    const publicPaths = ['/Login', '/', '/Reg'];

    if (!token && !publicPaths.includes(to.path)) {
        ErrorInformation('请先登录或注册');
        return next({ path: '/', query: { redirect: to.fullPath } });
    }

    if (token && publicPaths.includes(to.path)) {
        const redirectPath = from.path && !publicPaths.includes(from.path) ? from.path : '/Home';
        return next({ path: redirectPath });
    }

    next();
});