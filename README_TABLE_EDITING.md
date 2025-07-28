# Інструкція з редагування таблиць

## Як редагувати структуру таблиць

### 1. Редагування колонок

Колонки таблиці визначаються в компоненті `DataTable.tsx` в секції `<thead>`:

```tsx
<thead className={`bg-${theme}-muted border-b`}>
  <tr>
    <th className="text-left p-2 md:p-4 font-medium">Назва</th>
    <th className="text-left p-2 md:p-4 font-medium hidden sm:table-cell">Статус</th>
    <th className="text-left p-2 md:p-4 font-medium hidden md:table-cell">Дата</th>
    <th className="text-left p-2 md:p-4 font-medium hidden md:table-cell">Сума</th>
    {(theme === 'orders' || theme === 'finance') && (
      <th className="text-left p-2 md:p-4 font-medium hidden lg:table-cell">Зображення</th>
    )}
    <th className="text-left p-2 md:p-4 font-medium">Дії</th>
  </tr>
</thead>
```

**Щоб додати нову колонку:**
1. Додайте `<th>` елемент у відповідному місці
2. Додайте відповідний `<td>` елемент у секції `<tbody>`
3. Оновіть інтерфейс `DataRow` у файлі `DataTable.tsx`

### 2. Редагування типів даних

Структура даних визначається інтерфейсом `DataRow`:

```tsx
interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;  // Для замовлень та фінансів
  details: {
    description: string;
    priority: string;
    assignee?: string;
  };
}
```

**Щоб додати нове поле:**
1. Додайте поле в інтерфейс `DataRow`
2. Оновіть початкові дані в `Dashboard.tsx`
3. Додайте поле в модальне вікно редагування `EditModal.tsx`

### 3. Редагування початкових даних

Початкові дані знаходяться в `Dashboard.tsx` в об'єкті `initialData`:

```tsx
const initialData = {
  orders: [
    {
      id: "1",
      name: "Замовлення #001",
      status: "В процесі",
      date: "2024-01-15",
      amount: "1,250 грн",
      details: {
        description: "Замовлення на поставку товарів",
        priority: "Високий",
        assignee: "Іван Петров"
      }
    }
    // ... інші записи
  ],
  // ... інші вкладки
};
```

### 4. Адаптивність

Колонки мають різні класи видимості для адаптивності:
- `hidden sm:table-cell` - видно з планшета
- `hidden md:table-cell` - видно з десктопа  
- `hidden lg:table-cell` - видно на великих екранах

### 5. Кольорові теми

Кожна вкладка має свою кольорову тему:
- `orders` - синя
- `inventory` - зелена
- `clients` - фіолетова
- `finance` - золота

### 6. Функціонал зображень

Зображення доступні тільки для вкладок "Замовлення" та "Фінанси". Код перевіряє:

```tsx
{(theme === 'orders' || theme === 'finance') && (
  // колонка зображення
)}
```

### 7. Модальне вікно редагування

Форма редагування знаходиться в компоненті `EditModal.tsx`. Додавання нових полів:

1. Додайте поле у стан `formData`
2. Створіть відповідний input/select елемент
3. Додайте обробник `handleInputChange`

### 8. Валідація

Базова валідація реалізована в методі `handleSave`:

```tsx
if (!formData.name.trim()) {
  toast({
    title: "Помилка",
    description: "Назва не може бути пустою",
    variant: "destructive"
  });
  return;
}
```

### 9. Дії з рядками

Основні дії:
- **Редагувати** - відкриває модальне вікно
- **Видалити** - видаляє рядок з підтвердженням
- **Завершити** - змінює статус на "Завершено"

### 10. Розширені деталі

При натисканні на рядок він розширюється і показує:
- Детальний опис
- Пріоритет
- Відповідального
- Зображення (якщо є)
- Додаткові кнопки дій