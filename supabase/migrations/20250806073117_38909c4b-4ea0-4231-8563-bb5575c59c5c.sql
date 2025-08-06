-- Додаємо відсутні поля до таблиці sub_orders
ALTER TABLE public.sub_orders 
ADD COLUMN type TEXT,
ADD COLUMN quantity TEXT,
ADD COLUMN parameters TEXT,
ADD COLUMN image_url TEXT;