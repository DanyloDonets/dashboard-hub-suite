-- Додаємо RLS політики для публічного доступу до всіх таблиць

-- Політики для orders
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Політики для sub_orders  
CREATE POLICY "Allow all operations on sub_orders" ON public.sub_orders FOR ALL USING (true) WITH CHECK (true);

-- Політики для inventory
CREATE POLICY "Allow all operations on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

-- Політики для sub_order_materials
CREATE POLICY "Allow all operations on sub_order_materials" ON public.sub_order_materials FOR ALL USING (true) WITH CHECK (true);

-- Політики для clients
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Політики для client_contacts
CREATE POLICY "Allow all operations on client_contacts" ON public.client_contacts FOR ALL USING (true) WITH CHECK (true);

-- Політики для logs
CREATE POLICY "Allow all operations on logs" ON public.logs FOR ALL USING (true) WITH CHECK (true);