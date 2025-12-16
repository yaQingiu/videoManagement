import { ElNotification } from 'element-plus';
import { notificationTypes } from 'element-plus';

type NotificationType = typeof notificationTypes[number];

export function SuccessInformation(
  response: string, 
  type: NotificationType = 'success',
  dangerouslyUseHTMLString: boolean = false
): void {
  ElNotification({
    title: 'Success',
    message: response,
    type,
    duration: 3000,
    dangerouslyUseHTMLString
  });
}

export function ErrorInformation(
  err: string,
  type: NotificationType = 'error',
  dangerouslyUseHTMLString: boolean = false
): void {
  ElNotification({
    title: 'Error',
    message: err,
    type,
    duration: 3000,
    dangerouslyUseHTMLString
  });
}