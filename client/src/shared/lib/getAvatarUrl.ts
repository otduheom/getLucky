/**
 * Получает URL для аватара пользователя
 * @param avatarPath - путь к аватару (например, "/uploads/avatars/avatar-1-123.jpg")
 * @returns полный URL для загрузки аватара или undefined
 */
export function getAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) {
    return undefined;
  }
  
  // Если путь уже абсолютный (начинается с http:// или https://), возвращаем как есть
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Иначе возвращаем относительный путь (сервер будет обслуживать статические файлы)
  return avatarPath;
}

