import{
    createRouter,
    createWebHashHistory
} from 'vue-router'

// import Login from'~/pages/login.vue'
// import Entry from'~/pages/entry.vue'
// import Lose from'~/pages/404.vue'
// import Home from'~/pages/home.vue'
// import User from '~/pages/user.vue'
// import Reg from '~/pages/register.vue'
// import Begin from '~/pages/begin.vue'
// import Equipments from '~/pages/equipments.vue'
// import Params from '~/pages/params.vue'
// import Analysis from '~/pages/analysis.vue'
// import Vision from '~/pages/vision.vue'
const routes=[{
    path:"/",
    component: () => import('~/pages/entry.vue')
},
{
    path:"/Login",
    component: () => import('~/pages/login.vue')
},
{
    path:"/Home",
    component: () => import('~/pages/home.vue')
},
{
    path:"/User",
    component: () => import('~/pages/user.vue')
},
{
    path:"/Reg",
    component: () => import('~/pages/register.vue')
},
{
    path:"/Begin",
    component: () => import('~/pages/begin.vue')
},
{
    path:"/Equipments",
    component: () => import('~/pages/equipments.vue')
},
{
    path:"/Params",
    component: () => import('~/pages/params.vue')
},
{
    path:"/Analysis",
    component: () => import('~/pages/analysis.vue')
},
{
    path:"/Vision",
    component: () => import('~/pages/vision.vue')
},
{ path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: () => import('~/pages/404.vue') }
]

const router=createRouter({
    history:createWebHashHistory(),
    routes
})

export default router