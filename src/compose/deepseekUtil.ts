import type { DeepSeekResponse } from '~/types/deepseek';

/**
 * @param response
 * @returns
 */
export function processDeepSeekResponse(response: DeepSeekResponse): string {
  try {
    const content = extractContentFromResponse(response);
    
    const formattedContent = formatContent(content);
    
    return formattedContent;
  } catch (error) {
    console.error('处理 DeepSeek 响应时出错:', error);
    throw new Error('处理 AI 响应失败，请重试');
  }
}

function extractContentFromResponse(response: DeepSeekResponse): string {
  if (!response?.choices?.length) {
    throw new Error('无效的响应格式：缺少 choices 字段');
  }
  const firstChoice = response.choices[0];
  if (!firstChoice?.message?.content) {
    throw new Error('无效的响应格式：缺少消息内容');
  }
  return firstChoice.message.content;
}

function formatContent(content: string): string {
  if (!content) return '';
  
  let formatted = content.replace(/\\n/g, '\n');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.trim();
  
  return formatted;
}


export function getChatContent(response: DeepSeekResponse): string {
  return response.choices[0]?.message?.content?.replace(/\\n/g, '\n') || '';
}