export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
  if (diff < 1) return 'Vừa gọi';
  if (diff < 60) return `${diff} phút trước`;
  const hours = Math.floor(diff / 60);
  return `${hours} giờ ${diff % 60} phút trước`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
