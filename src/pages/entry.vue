<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <span class="info1">info1</span>
        <span class="info2">info2</span>
        <span class="info3">info3</span>
        <span class="info4">info4</span>
        <span class="info5">info5</span>
      </el-header>
      <div class="info-panel" v-show="infoSelected != ''">
        <div class="info1-panel" v-show="infoSelected === 'info1'">info1: here is a info panel which can show info1's details</div>
        <div class="info2-panel" v-show="infoSelected === 'info2'">info2: here is a info panel which can show info2's details</div>
        <div class="info3-panel" v-show="infoSelected === 'info3'">info3: here is a info panel which can show info3's details</div>  
        <div class="info4-panel" v-show="infoSelected === 'info4'">info4: here is a info panel which can show info4's details</div>
        <div class="info5-panel" v-show="infoSelected === 'info5'">info5: here is a info panel which can show info5's details</div>
      </div>
      <el-container>
        <el-main>
          <div id="hello" :style="{ fontSize: '50px', fontWeight: 'bold' }">Hello</div>
          <div id="welcome" :style="{ fontSize: '30px', fontWeight: 'bold' }">Welcome</div>
        </el-main>
        <el-aside width="20vw">
          <div class="register">
            <el-icon><User /></el-icon>
            <span class="btn" @click="router.push('/Reg')">没有账号？去注册</span>
          </div>
          <div class="login">
            <el-icon><User /></el-icon>
            <span class="btn" @click="router.push('/Login')">已有账号？去登录</span>
          </div>
        </el-aside>
      </el-container>
    </el-container>
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { User } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter(); 
const infoSelected = ref('');
const bgCanvas = ref<HTMLCanvasElement | null>(null);

class Petal {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() + 0.5
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.size = Math.random() * 5 + 1
    const blues = ['#E0FFFF', '#87CEFA', '#00BFFF', '#1E90FF', '#6495ED']
    this.color = blues[Math.floor(Math.random() * blues.length)]
    this.maxLife = 60 
    this.life = this.maxLife
    this.alpha = 0.8
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.life--
    this.alpha = Math.max(0, this.life / this.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

let animationId: number
const petals: Petal[] = []
let stopAnimation: (() => void) | undefined

const initAnimation = () => {
  const canvas = bgCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  const handleMouseMove = (e: MouseEvent) => {
    for (let i = 0; i < 2; i++) {
      petals.push(new Petal(e.clientX, e.clientY))
    }
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i]
      p.update()
      p.draw(ctx)
      if (p.life <= 0) {
        petals.splice(i, 1)
      }
    }
    
    animationId = requestAnimationFrame(animate)
  }
  
  animate()

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
    cancelAnimationFrame(animationId)
  }
}

type ListenerRecord = {
  el: Element;
  enter: EventListenerOrEventListenerObject;
  leave: EventListenerOrEventListenerObject;
};

const listeners: ListenerRecord[] = []

onMounted(() => {
  const nodes = Array.from(document.querySelectorAll('.info1, .info2, .info3, .info4, .info5'))
  const infoPanelEl = document.querySelector('.info-panel') as HTMLElement | null
  
  let timer: ReturnType<typeof setTimeout> | null = null
  
  const clearHideTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const delayHide = () => {
    timer = setTimeout(() => {
      infoSelected.value = ''
    }, 100) // 100ms 延迟，防止闪烁并允许鼠标移入面板
  }

  nodes.forEach(el => {
    const enter = () => {
      clearHideTimer()
      infoSelected.value = (el.className || '').toString().split(' ')[0]
    }
    const leave = () => {
      delayHide()
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    listeners.push({ el, enter, leave })
  })

  if (infoPanelEl) {
    const enterPanel = () => clearHideTimer()
    const leavePanel = () => delayHide()
    
    infoPanelEl.addEventListener('mouseenter', enterPanel)
    infoPanelEl.addEventListener('mouseleave', leavePanel)
    listeners.push({ el: infoPanelEl, enter: enterPanel, leave: leavePanel })
  }

  const headerEl = document.querySelector('.el-header') as HTMLElement | null

  const updateInfoPanelTop = () => {
    if (!headerEl || !infoPanelEl) return
    const rect = headerEl.getBoundingClientRect()
    infoPanelEl.style.top = `${rect.bottom}px`
  }

  if (infoPanelEl) {
    updateInfoPanelTop()
    window.addEventListener('resize', updateInfoPanelTop)
    window.addEventListener('scroll', updateInfoPanelTop)
    listeners.push({ el: window as unknown as Element, enter: updateInfoPanelTop, leave: updateInfoPanelTop })
  }
  
  stopAnimation = initAnimation()
})

onBeforeUnmount(() => {
  listeners.forEach(({ el, enter, leave }) => {
    el.removeEventListener('mouseenter', enter)
    el.removeEventListener('mouseleave', leave)
  })
  try {
    window.removeEventListener('resize', () => {})
    window.removeEventListener('scroll', () => {})
  } catch (e) {
  }
  listeners.length = 0
  
  if (stopAnimation) stopAnimation()
})
</script>

<style>
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.common-layout {
    background-color: rgb(255, 248, 253);
    background-image: url("../assets/pictures/background.jpg");
    background-size: cover;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.el-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
}

.el-header span {
    cursor: pointer;
}

.el-main{
  background-color: rgba(52, 38, 49, 0.408);
  min-height: 500px;
  overflow: auto;
  align-items: center;
  justify-content: center;
  padding-top: 300px;
}
.el-main > div {
  font-size: 30px;
  color: white;
  margin-top: 70px;
}
.el-aside {
    background-color: rgba(255, 255, 255, 0.84);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.el-aside div{
    text-decoration: none;
    margin: 30px;
    font-size: 15px;
    color: rgb(84, 84, 84);
}
.el-aside div:hover{
    color: black;
    cursor: pointer;
    transition: all 0.3s;
}
.info1, .info2, .info3, .info4, .info5 {
    margin: 0 20px;
    font-size: 15px;
    color: white;
}


.info-panel {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999;
  width: 100%;
  height: 30vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.468);
}

.info-panel > div {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>