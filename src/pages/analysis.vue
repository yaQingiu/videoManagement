<template>
  <div class="chat-wrapper">
    <div class="top-content">
      <div class="chat-container" ref="chatContainerRef">
        
        <div v-for="(message, index) in messages" :key="index" 
             class="message-row" 
             :class="message.type === 'user' ? 'row-right' : 'row-left'">
             
          <div class="chat-bubble" :class="message.type">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-analysis">
      <div class="input-request">
        <el-input 
          v-model="question" 
          placeholder="在此输入问题..." 
          style="width: 80%;"
          @keyup.enter="sendQuestion" 
          :disabled="isLoading" 
        />
        <el-button 
          type="primary" 
          @click="sendQuestion" 
          style="margin-left: 10px;"
          :loading="isLoading"
          :disabled="isLoading || !question.trim()"
        >
          {{ isLoading ? '思考中' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { streamChat } from '~/api/agentManager';

const question = ref<string>(''); 
const messages = ref<{ type: 'user' | 'ai'; content: string }[]>([]);
const isLoading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const sendQuestion = () => {
  const userText = question.value.trim();
  if (!userText || isLoading.value) return; 

  messages.value.push({ type: 'user', content: userText });
  question.value = '';
  scrollToBottom();

  messages.value.push({ type: 'ai', content: '' });

  const currentAiMessage = messages.value[messages.value.length - 1];

  isLoading.value = true;

  streamChat(
    userText,
    (delta) => {
      currentAiMessage.content += delta;
      scrollToBottom();
    },
    () => {
      isLoading.value = false;
    }
  );
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 93%; 
  background-color: transparent;
}

.top-content {
  flex: 1;
  height: 85%;
  overflow: hidden;
  padding-bottom: 20px;
}

.chat-container {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f9f9f9;
}

.message-row {
  display: flex;
  margin-bottom: 15px;
  width: 100%;
}

.row-right {
  justify-content: flex-end;
}

.row-left {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

.chat-bubble.user {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 2px;
}

.chat-bubble.ai {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 2px;
}

.message-text {
  white-space: pre-wrap; 
  text-align: left;
}

.bottom-analysis {
  margin-top: 10px;
}

.input-request {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>