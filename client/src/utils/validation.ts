/**
 * Утилиты для валидации данных расклада Таро
 * 
 * Централизованная валидация позволяет:
 * - Избежать дублирования кода
 * - Легко изменять правила валидации в одном месте
 * - Переиспользовать логику в разных компонентах
 */

/** Минимальная длина вопроса для расклада */
export const MIN_QUESTION_LENGTH = 10;

/** Количество карт, необходимое для расклада */
export const MAX_CARDS = 3;

/**
 * Валидация вопроса пользователя
 * 
 * @param question - текст вопроса
 * @returns null если валидация прошла успешно, иначе - сообщение об ошибке
 */
export function validateQuestion(question: string): string | null {
  const trimmed = question.trim();
  
  // Проверка на пустой вопрос
  if (trimmed.length === 0) {
    return 'Вопрос не может быть пустым';
  }
  
  // Проверка минимальной длины
  if (trimmed.length < MIN_QUESTION_LENGTH) {
    return `Вопрос должен содержать минимум ${MIN_QUESTION_LENGTH} символов`;
  }
  
  return null;
}

/**
 * Валидация количества вытянутых карт
 * 
 * @param count - количество вытянутых карт
 * @returns null если валидация прошла успешно, иначе - сообщение об ошибке
 */
export function validateCardsCount(count: number): string | null {
  if (count !== MAX_CARDS) {
    return `Необходимо вытянуть ${MAX_CARDS} карты`;
  }
  return null;
}

