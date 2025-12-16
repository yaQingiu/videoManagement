
function cleanDelta(text: string): string {
  if (!text) return "";
  return text.replace(/\\n/g, "\n");
}

/**
 * @param message 用户问题
 * @param onMessage 接收到新字符时的回调
 * @param onFinish 对话结束时的回调（无论是正常结束还是报错结束）
 */
export function streamChat(
  message: string, 
  onMessage: (text: string) => void,
  onFinish?: () => void
) {
    const url = `/api/agent/chat?message=${encodeURIComponent(message)}`;
    
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
            console.log("AI 回答完毕，主动关闭连接");
            eventSource.close();
            if (onFinish) onFinish();
            return;
        }

        try {
            const json = JSON.parse(event.data);
            const delta = json?.choices?.[0]?.delta?.content;

            if (delta) {
                const clean = cleanDelta(delta);
                onMessage(clean);
            }
        } catch (e) {
            console.error("解析流式数据失败:", e);
        }
    };

    eventSource.onerror = (err) => {
        console.error("SSE 连接异常或结束:", err);
        eventSource.close();
        if (onFinish) onFinish();
    };

    return eventSource;
}