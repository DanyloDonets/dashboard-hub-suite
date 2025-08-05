import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useSupabaseData = () => {
  const [data, setData] = useState({
    orders: [],
    inventory: [],
    clients: []
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Використовуємо any для запитів поки типи не оновляться
      const [ordersResult, inventoryResult, clientsResult, contactsResult] = await Promise.all([
        (supabase as any).from('orders').select('*'),
        (supabase as any).from('inventory').select('*'),
        (supabase as any).from('clients').select('*'),
        (supabase as any).from('client_contacts').select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (inventoryResult.error) throw inventoryResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (contactsResult.error) throw contactsResult.error;

      // Трансформуємо дані для відображення
      const transformedData = {
        orders: transformOrders(ordersResult.data || []),
        inventory: transformInventory(inventoryResult.data || []),
        clients: transformClients(clientsResult.data || [], contactsResult.data || [])
      };

      setData(transformedData);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async (order: any) => {
    try {
      // Перевіряємо чи це новий запис
      const isNewOrder = !order.id || order.id === 'new' || typeof order.id === 'number' || /^\d+$/.test(order.id);
      
      // Валідуємо дату доставки
      let deliveryDate = null;
      if (order.deliveryDate && order.deliveryDate !== '-' && order.deliveryDate.trim() !== '') {
        try {
          deliveryDate = new Date(order.deliveryDate).toISOString();
        } catch (dateError) {
          console.warn('Неправильний формат дати доставки:', order.deliveryDate);
          deliveryDate = null;
        }
      }
      
      if (isNewOrder) {
        const { error } = await (supabase as any).from('orders').insert({
          name: order.name,
          status: order.status,
          priority: order.priority,
          delivery_date: deliveryDate,
          notes: order.notes
        });
        
        if (error) throw error;
        logger.log('Створення замовлення', `Створено замовлення "${order.name}"`, 'Користувач');
      } else {
        const { error } = await (supabase as any).from('orders').update({
          name: order.name,
          status: order.status,
          priority: order.priority,
          delivery_date: deliveryDate,
          notes: order.notes,
          updated_at: new Date().toISOString()
        }).eq('id', order.id);
        
        if (error) throw error;
        logger.log('Оновлення замовлення', `Оновлено замовлення "${order.name}"`, 'Користувач');
      }
      await loadData();
    } catch (error) {
      console.error('Помилка збереження замовлення:', error);
      logger.log('Помилка', `Помилка збереження замовлення: ${error.message}`, 'Система');
      throw error;
    }
  };

  const saveInventory = async (item: any) => {
    try {
      // Перевіряємо чи це новий запис
      const isNewItem = !item.id || item.id === 'new' || typeof item.id === 'number' || /^\d+$/.test(item.id);
      
      if (isNewItem) {
        const { error } = await (supabase as any).from('inventory').insert({
          name: item.name,
          weight: parseFloat(item.weight || '0'),
          unit: item.unit,
          image_url: item.imageUrl
        });
        
        if (error) throw error;
        logger.log('Створення матеріалу', `Додано матеріал "${item.name}" (${item.weight} ${item.unit})`, 'Користувач');
      } else {
        const { error } = await (supabase as any).from('inventory').update({
          name: item.name,
          weight: parseFloat(item.weight || '0'),
          unit: item.unit,
          image_url: item.imageUrl,
          updated_at: new Date().toISOString()
        }).eq('id', item.id);
        
        if (error) throw error;
        logger.log('Оновлення матеріалу', `Оновлено матеріал "${item.name}" (${item.weight} ${item.unit})`, 'Користувач');
      }
      await loadData();
    } catch (error) {
      console.error('Помилка збереження матеріалу:', error);
      logger.log('Помилка', `Помилка збереження матеріалу: ${error.message}`, 'Система');
      throw error;
    }
  };

  const saveClient = async (client: any) => {
    try {
      let clientId = client.id;
      
      // Перевіряємо чи це новий клієнт (id це timestamp або 'new')
      const isNewClient = !client.id || client.id === 'new' || typeof client.id === 'number' || /^\d+$/.test(client.id);
      
      if (isNewClient) {
        const { data: newClient, error } = await (supabase as any).from('clients').insert({
          name: client.name
        }).select().single();
        
        if (error) throw error;
        clientId = newClient.id;
        logger.log('Створення клієнта', `Додано клієнта "${client.name}"`, 'Користувач');
      } else {
        const { error } = await (supabase as any).from('clients').update({
          name: client.name,
          updated_at: new Date().toISOString()
        }).eq('id', client.id);
        
        if (error) throw error;
        logger.log('Оновлення клієнта', `Оновлено клієнта "${client.name}"`, 'Користувач');
      }

      // Оновлюємо контакти
      if (client.contacts) {
        // Видаляємо старі контакти
        await (supabase as any).from('client_contacts').delete().eq('client_id', clientId);
        
        // Додаємо нові контакти
        if (client.contacts.length > 0) {
          const contactsToInsert = client.contacts
            .filter((contact: any) => contact.value.trim())
            .map((contact: any) => ({
              client_id: clientId,
              type: contact.type,
              value: contact.value
            }));
          
          if (contactsToInsert.length > 0) {
            const { error } = await (supabase as any).from('client_contacts').insert(contactsToInsert);
            if (error) throw error;
          }
        }
      }
      
      await loadData();
    } catch (error) {
      console.error('Помилка збереження клієнта:', error);
      logger.log('Помилка', `Помилка збереження клієнта: ${error.message}`, 'Система');
      throw error;
    }
  };

  const deleteRecord = async (id: string, table: string) => {
    try {
      const { error } = await (supabase as any).from(table).delete().eq('id', id);
      if (error) throw error;
      logger.log('Видалення', `Видалено запис з таблиці ${table}`, 'Користувач');
      await loadData();
    } catch (error) {
      console.error('Помилка видалення запису:', error);
      logger.log('Помилка', `Помилка видалення з ${table}: ${error.message}`, 'Система');
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    loadData,
    saveOrder,
    saveInventory,
    saveClient,
    deleteRecord
  };
};

// Функції трансформації даних
const transformOrders = (orders: any[]) => {
  return orders.map(order => ({
    id: order.id,
    name: order.name,
    status: order.status,
    date: new Date(order.created_at).toLocaleDateString('uk-UA'),
    amount: order.total_weight ? `${order.total_weight} кг` : '0 кг',
    client: "Не вказано",
    orderDate: new Date(order.created_at).toLocaleDateString('uk-UA'),
    deliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('uk-UA') : undefined,
    subOrders: [],
    details: {
      description: order.notes || '',
      priority: order.priority,
      assignee: "Не вказано"
    }
  }));
};

const transformInventory = (inventory: any[]) => {
  return inventory.map(item => ({
    id: item.id,
    name: item.name,
    status: item.weight > 10 ? "В наявності" : "Закінчується",
    date: new Date(item.updated_at).toLocaleDateString('uk-UA'),
    amount: `${item.weight} ${item.unit}`,
    weight: item.weight,
    unit: item.unit,
    details: {
      description: item.image_url || '',
      priority: item.weight > 10 ? "Нормальний" : "Високий",
      assignee: "Склад"
    }
  }));
};

const transformClients = (clients: any[], contacts: any[]) => {
  return clients.map(client => {
    const clientContacts = contacts
      .filter(contact => contact.client_id === client.id)
      .map(contact => ({
        id: contact.id,
        type: contact.type,
        value: contact.value
      }));
    
    return {
      id: client.id,
      name: client.name,
      status: "Активний",
      date: new Date(client.created_at).toLocaleDateString('uk-UA'),
      amount: "0 грн",
      contacts: clientContacts,
      details: {
        description: "Клієнт компанії",
        priority: "Середній",
        assignee: "Менеджер"
      }
    };
  });
};