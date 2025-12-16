<template>
  <div v-if="isVisible" class="progress-bar">
    <div class="progress-bar-inner" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    progress: {
      type: Number,
      required: true
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
.progress-bar {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 5px;
  background-color: #f3f3f3;
  z-index: 1000;
}

.progress-bar-inner {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s ease;
}
</style>