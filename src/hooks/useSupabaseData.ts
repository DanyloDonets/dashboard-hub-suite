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
      const [ordersResult, inventoryResult, clientsResult, contactsResult, subOrdersResult, subOrderMaterialsResult] = await Promise.all([
        (supabase as any).from('orders').select('*'),
        (supabase as any).from('inventory').select('*'),
        (supabase as any).from('clients').select('*'),
        (supabase as any).from('client_contacts').select('*'),
        (supabase as any).from('sub_orders').select('*'),
        (supabase as any).from('sub_order_materials').select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (inventoryResult.error) throw inventoryResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (subOrdersResult.error) throw subOrdersResult.error;
      if (subOrderMaterialsResult.error) throw subOrderMaterialsResult.error;

      // Трансформуємо дані для відображення
      const transformedData = {
        orders: transformOrders(ordersResult.data || [], subOrdersResult.data || [], subOrderMaterialsResult.data || [], inventoryResult.data || []),
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

  const deleteSubOrder = async (subOrderId: string, returnMaterials = true) => {
    try {
      // Якщо потрібно повернути матеріали, спочатку отримуємо їх список
      if (returnMaterials) {
        const { data: materials } = await (supabase as any)
          .from('sub_order_materials')
          .select('inventory_id, weight')
          .eq('sub_order_id', subOrderId);
        
        if (materials && materials.length > 0) {
          // Повертаємо матеріали на склад
          for (const material of materials) {
            await (supabase as any)
              .from('inventory')
              .update({ 
                weight: (supabase as any).sql`weight + ${material.weight}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', material.inventory_id);
          }
        }
      }

      // Видаляємо матеріали підзамовлення
      await (supabase as any).from('sub_order_materials').delete().eq('sub_order_id', subOrderId);
      
      // Видаляємо підзамовлення
      const { error } = await (supabase as any).from('sub_orders').delete().eq('id', subOrderId);
      if (error) throw error;
      
      logger.log('Видалення підзамовлення', `Видалено підзамовлення ${subOrderId}`, 'Користувач');
      await loadData();
    } catch (error) {
      console.error('Помилка видалення підзамовлення:', error);
      logger.log('Помилка', `Помилка видалення підзамовлення: ${error.message}`, 'Система');
      throw error;
    }
  };

  const saveSubOrder = async (subOrder: any, orderId: string) => {
    try {
      // Перевіряємо чи це новий підзапис
      const isNewSubOrder = !subOrder.id || subOrder.id === 'new' || typeof subOrder.id === 'number' || /^\d+$/.test(subOrder.id);
      
      let subOrderId = subOrder.id;
      
      const subOrderData = {
        order_id: orderId,
        name: subOrder.name,
        type: subOrder.type || null,
        quantity: subOrder.quantity || null,
        parameters: subOrder.parameters || null,
        status: subOrder.status || 'В роботі',
        notes: subOrder.details?.description || '',
        image_url: subOrder.image || null,
        delivery_date: subOrder.deliveryDate ? new Date(subOrder.deliveryDate).toISOString() : null
      };
      
      if (isNewSubOrder) {
        const { data: newSubOrder, error } = await (supabase as any).from('sub_orders').insert(subOrderData).select().single();
        
        if (error) throw error;
        subOrderId = newSubOrder.id;
        logger.log('Створення підзамовлення', `Створено підзамовлення "${subOrder.name}" для замовлення ${orderId}`, 'Користувач');
      } else {
        // Перед оновленням отримуємо старі матеріали для повернення на склад
        const { data: oldMaterials } = await (supabase as any)
          .from('sub_order_materials')
          .select('inventory_id, weight')
          .eq('sub_order_id', subOrder.id);
        
        // Повертаємо старі матеріали на склад
        if (oldMaterials && oldMaterials.length > 0) {
          for (const material of oldMaterials) {
            await (supabase as any)
              .from('inventory')
              .update({ 
                weight: (supabase as any).sql`weight + ${material.weight}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', material.inventory_id);
          }
        }
        
        // Видаляємо старі матеріали
        await (supabase as any).from('sub_order_materials').delete().eq('sub_order_id', subOrder.id);
        
        const { error } = await (supabase as any).from('sub_orders').update(subOrderData).eq('id', subOrder.id);
        
        if (error) throw error;
        logger.log('Оновлення підзамовлення', `Оновлено підзамовлення "${subOrder.name}"`, 'Користувач');
      }

      // Зберігаємо матеріали підзамовлення
      if (subOrder.materials && subOrder.materials.length > 0) {
        // Додаємо нові матеріали
        const materialsToInsert = subOrder.materials.map((material: any) => ({
          sub_order_id: subOrderId,
          inventory_id: material.materialId,
          weight: material.requiredWeight
        }));
        
        const { error: materialsError } = await (supabase as any).from('sub_order_materials').insert(materialsToInsert);
        if (materialsError) throw materialsError;
        
        logger.log('Додавання матеріалів', `Додано ${subOrder.materials.length} матеріалів до підзамовлення "${subOrder.name}"`, 'Користувач');
      }
      
      await loadData();
    } catch (error) {
      console.error('Помилка збереження підзамовлення:', error);
      logger.log('Помилка', `Помилка збереження підзамовлення: ${error.message}`, 'Система');
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
    saveSubOrder,
    deleteRecord,
    deleteSubOrder
  };
};

// Функції трансформації даних
const transformOrders = (orders: any[], subOrders: any[], subOrderMaterials: any[], inventory: any[]) => {
  return orders.map(order => {
    // Знаходимо підзамовлення для цього замовлення
    const orderSubOrders = subOrders
      .filter(subOrder => subOrder.order_id === order.id)
      .map(subOrder => {
        // Знаходимо матеріали для цього підзамовлення
        const subOrderMaterialsData = subOrderMaterials
          .filter(sm => sm.sub_order_id === subOrder.id)
          .map(sm => {
            const material = inventory.find(inv => inv.id === sm.inventory_id);
            return {
              materialId: sm.inventory_id,
              materialName: material ? material.name : 'Невідомий матеріал',
              requiredWeight: sm.weight
            };
          });

        return {
          id: subOrder.id,
          name: subOrder.name,
          status: subOrder.status,
          type: subOrder.type || '',
          quantity: subOrder.quantity || '',
          parameters: subOrder.parameters || '',
          description: subOrder.notes || '',
          deliveryDate: subOrder.delivery_date ? new Date(subOrder.delivery_date).toLocaleDateString('uk-UA') : undefined,
          materials: subOrderMaterialsData,
          image: subOrder.image_url || null
        };
      });

    return {
      id: order.id,
      name: order.name,
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString('uk-UA'),
      amount: order.total_weight ? `${order.total_weight} кг` : '0 кг',
      client: "Не вказано",
      orderDate: new Date(order.created_at).toLocaleDateString('uk-UA'),
      deliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('uk-UA') : undefined,
      subOrders: orderSubOrders,
      details: {
        description: order.notes || '',
        priority: order.priority,
        assignee: "Не вказано"
      }
    };
  });
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