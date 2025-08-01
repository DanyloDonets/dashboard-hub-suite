import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Plus, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditModal } from "./EditModal";
import { NewOrderModal } from "./NewOrderModal";
import { SubOrderModal } from "./SubOrderModal";
import { AddMaterialModal } from "./AddMaterialModal";
import { InventoryModal } from "./InventoryModal";
import { ClientModal } from "./ClientModal";
import type { TabType } from "./TabNavigation";
import { logger } from "@/utils/logger";

interface Contact {
  id: string;
  type: "phone" | "email";
  value: string;
}

interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;
  client?: string;
  clientId?: string;
  weight?: number;
  unit?: string;
  contacts?: Contact[];
  orderDate?: string;
  deliveryDate?: string;
  accountNumber?: string;
  expenseNumber?: string;
  executor?: string;
  subOrders?: any[];
  details: {
    description: string;
    priority: string;
    assignee?: string;
  };
}

interface DataTableProps {
  theme: TabType;
  data: DataRow[];
  onDataChange: (newData: DataRow[]) => void;
  materials?: any[];
  onMaterialAdd?: (materialId: string, weight: number) => void;
  clients?: any[];
}

export function DataTable({ theme, data, onDataChange, materials = [], onMaterialAdd, clients = [] }: DataTableProps) {
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isSubOrderModalOpen, setIsSubOrderModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [editingSubOrder, setEditingSubOrder] = useState<any>(null);
  const [expandedSubOrder, setExpandedSubOrder] = useState<string | null>(null);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [selectedMaterialForAdd, setSelectedMaterialForAdd] = useState<string>("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (theme === "orders") {
      setIsNewOrderModalOpen(true);
    } else if (theme === "inventory") {
      setEditingRow(null);
      setIsInventoryModalOpen(true);
    } else if (theme === "clients") {
      setEditingRow(null);
      setIsClientModalOpen(true);
    } else {
      setEditingRow(null);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (row: DataRow) => {
    setEditingRow(row);
    if (theme === "inventory") {
      setIsInventoryModalOpen(true);
    } else if (theme === "clients") {
      setIsClientModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
    logger.log("Відкриття редагування", `Редагування запису ${row.id}`, "Користувач");
  };

  const handleSubOrderEdit = (subOrder: any) => {
    setEditingSubOrder(subOrder);
    setIsSubOrderModalOpen(true);
    logger.log("Відкриття редагування підзамовлення", `Редагування підзамовлення ${subOrder.id}`, "Користувач");
  };

  const handleDelete = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onDataChange(newData);
    logger.log("Видалення", `Видалено запис ${data[index].id}`, "Користувач");
    toast({
      title: "Видалено",
      description: "Запис успішно видалено"
    });
  };

  const handleSave = (updatedRow: DataRow) => {
    if (editingRow) {
      const newData = data.map(row => row.id === editingRow.id ? updatedRow : row);
      onDataChange(newData);
      logger.log("Оновлення", `Оновлено запис ${updatedRow.id}`, "Користувач");
    } else {
      onDataChange([...data, { ...updatedRow, id: Date.now().toString() }]);
      logger.log("Створення", `Створено новий запис ${updatedRow.id}`, "Користувач");
    }
  };

  const handleSubOrderSave = (updatedSubOrder: any) => {
    if (!currentOrderId) return;
    
    const newData = data.map(order => {
      if (order.id === currentOrderId) {
        const subOrders = order.subOrders || [];
        if (editingSubOrder) {
          const updatedSubOrders = subOrders.map(sub => 
            sub.id === editingSubOrder.id ? updatedSubOrder : sub
          );
          return { ...order, subOrders: updatedSubOrders };
        } else {
          return { ...order, subOrders: [...subOrders, { ...updatedSubOrder, id: Date.now().toString() }] };
        }
      }
      return order;
    });
    
    onDataChange(newData);
    logger.log("Підзамовлення", `${editingSubOrder ? 'Оновлено' : 'Створено'} підзамовлення`, "Користувач");
  };

  const addSubOrder = (orderId: string) => {
    setCurrentOrderId(orderId);
    setEditingSubOrder(null);
    setIsSubOrderModalOpen(true);
  };

  const handleMaterialAdd = (materialId: string) => {
    setSelectedMaterialForAdd(materialId);
    setIsAddMaterialModalOpen(true);
  };

  const handleAddMaterialWeight = (weight: number) => {
    if (onMaterialAdd && selectedMaterialForAdd) {
      onMaterialAdd(selectedMaterialForAdd, weight);
    }
  };

  const addContact = (rowIndex: number) => {
    const newData = [...data];
    const newContact = {
      id: Date.now().toString(),
      type: "phone" as const,
      value: ""
    };
    
    if (!newData[rowIndex].contacts) {
      newData[rowIndex].contacts = [];
    }
    newData[rowIndex].contacts!.push(newContact);
    onDataChange(newData);
  };

  const updateContact = (rowIndex: number, contactIndex: number, field: string, value: string) => {
    const newData = [...data];
    if (newData[rowIndex].contacts) {
      newData[rowIndex].contacts![contactIndex] = {
        ...newData[rowIndex].contacts![contactIndex],
        [field]: value
      };
      onDataChange(newData);
    }
  };

  const removeContact = (rowIndex: number, contactIndex: number) => {
    const newData = [...data];
    if (newData[rowIndex].contacts) {
      newData[rowIndex].contacts = newData[rowIndex].contacts!.filter((_, i) => i !== contactIndex);
      onDataChange(newData);
    }
  };

  const openImageInNewTab = (imageUrl: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
    }
  };

  const getTableHeaders = () => {
    switch (theme) {
      case "orders":
        return ["Дані замовлення", "Дії"];
      case "inventory":
        return ["Матеріали", "Дії"];
      case "clients":
        return ["Клієнти", "Дії"];
      default:
        return ["Дані", "Дії"];
    }
  };

  const renderOrderData = (row: DataRow) => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3 text-lg">Дані для замовлення</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div><strong>Дата замовлення:</strong> {row.orderDate || row.date}</div>
          <div><strong>Дата відвантаження:</strong> {row.deliveryDate || "-"}</div>
          <div><strong>Замовник:</strong> {row.client || "Не вказано"}</div>
          <div><strong>Номер рахунку:</strong> {row.accountNumber || "-"}</div>
          <div><strong>№ видаткова:</strong> {row.expenseNumber || "-"}</div>
          <div><strong>Виконавець:</strong> {row.executor || "-"}</div>
        </div>
      </div>
      
      {row.subOrders && row.subOrders.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Підзамовлення ({row.subOrders.length})</h4>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => addSubOrder(row.id)}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              Додати підзамовлення
            </Button>
          </div>
          <div className="space-y-3">
            {row.subOrders.map((subOrder) => (
              <div key={subOrder.id} className="border rounded-lg">
                <div 
                  className={`p-3 cursor-pointer hover:bg-muted/20 transition-colors flex items-center justify-between`}
                  onClick={() => setExpandedSubOrder(expandedSubOrder === subOrder.id ? null : subOrder.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedSubOrder === subOrder.id ? 
                      <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                    <span className="font-medium">{subOrder.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${subOrder.status === 'Завершено' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {subOrder.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubOrderEdit(subOrder);
                    }}
                    className="gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Редагувати
                  </Button>
                </div>
                
                {expandedSubOrder === subOrder.id && (
                  <div className="px-4 pb-4 border-t bg-muted/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
                      <div><strong>Назва:</strong> {subOrder.name}</div>
                      <div><strong>Вид:</strong> {subOrder.type || "-"}</div>
                      <div><strong>Кількість:</strong> {subOrder.quantity || "-"}</div>
                      <div><strong>Параметри:</strong> {subOrder.parameters || "-"}</div>
                      <div className="md:col-span-2"><strong>Опис:</strong> {subOrder.description || "-"}</div>
                    </div>
                    
                    {subOrder.materials && subOrder.materials.length > 0 && (
                      <div className="mt-3">
                        <strong className="text-sm">Матеріали:</strong>
                        <div className="mt-1 space-y-1">
                          {subOrder.materials.map((material: any, idx: number) => (
                            <div key={idx} className="text-sm bg-background p-2 rounded border">
                              {material.materialName}: {material.requiredWeight} кг
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {subOrder.image && (
                      <div className="mt-3">
                        <strong className="text-sm">Зображення:</strong>
                        <div className="mt-1 flex gap-2">
                          <img
                            src={subOrder.image}
                            alt="Підзамовлення"
                            className="w-16 h-16 object-cover rounded border cursor-pointer"
                            onClick={() => openImageInNewTab(subOrder.image)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openImageInNewTab(subOrder.image)}
                            className="gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Відкрити
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {(!row.subOrders || row.subOrders.length === 0) && (
        <div className="border rounded-lg p-4 text-center">
          <p className="text-muted-foreground mb-3">Підзамовлення відсутні</p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => addSubOrder(row.id)}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Додати підзамовлення
          </Button>
        </div>
      )}
    </div>
  );

  const renderInventoryData = (row: DataRow, index: number) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{row.name}</h4>
          <p className="text-sm text-muted-foreground">Кількість: {row.weight || 0} {row.unit || 'кг'}</p>
          <p className="text-xs text-muted-foreground">Останнє оновлення: {row.date}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleMaterialAdd(row.id)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Додати матеріал
        </Button>
      </div>
      {row.details.description && (
        <div>
          <strong className="text-sm">Характеристики:</strong>
          <p className="text-sm">{row.details.description}</p>
        </div>
      )}
    </div>
  );

  const renderClientData = (row: DataRow, index: number) => (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{row.name}</h4>
      </div>
      
      {row.details.description && (
        <div>
          <strong className="text-sm">Контактна інформація:</strong>
          <p className="text-sm mt-1 whitespace-pre-line">{row.details.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {theme === "orders" ? "Замовлення" : theme === "inventory" ? "Склад" : "Клієнти"}
        </h2>
        <Button onClick={handleAdd} className={`bg-${theme} text-${theme}-foreground gap-2`}>
          <Plus className="w-4 h-4" />
          {theme === "orders" ? "Нове замовлення" : theme === "inventory" ? "Новий матеріал" : "Новий клієнт"}
        </Button>
      </div>

      {/* Data Cards */}
      <div className="grid gap-3">
        {data.map((row, index) => (
          <Card key={`${row.id}-${index}`} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{row.name}</h3>
                  <p className="text-sm text-muted-foreground">Дата: {row.date}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    row.status === 'Завершено' ? 'bg-green-100 text-green-800' : 
                    row.status === 'В процесі' ? 'bg-blue-100 text-blue-800' :
                    row.status === 'Активний' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.status}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(row)}
                    className="gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Редагувати
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Видалити
                  </Button>
                </div>
              </div>

              {/* Content based on theme */}
              {theme === "orders" && renderOrderData(row)}
              {theme === "inventory" && renderInventoryData(row, index)}
              {theme === "clients" && renderClientData(row, index)}
            </div>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {theme === "orders" ? "Замовлення відсутні" : theme === "inventory" ? "Матеріали відсутні" : "Клієнти відсутні"}
          </p>
          <Button onClick={handleAdd} className={`mt-3 bg-${theme} text-${theme}-foreground gap-2`}>
            <Plus className="w-4 h-4" />
            {theme === "orders" ? "Створити перше замовлення" : theme === "inventory" ? "Додати перший матеріал" : "Додати першого клієнта"}
          </Button>
        </Card>
      )}

      {/* Modals */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        row={editingRow}
        onSave={handleSave}
        theme={theme}
        materials={materials}
        onMaterialAdd={onMaterialAdd}
        clients={clients}
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        item={editingRow ? {
          id: editingRow.id,
          name: editingRow.name,
          weight: editingRow.weight,
          unit: editingRow.unit,
          characteristics: editingRow.details?.description,
          lastUpdated: editingRow.date
        } : null}
        onSave={(item) => {
          const updatedRow: DataRow = {
            id: item.id,
            name: item.name,
            status: "Активний",
            date: item.lastUpdated || new Date().toISOString().split('T')[0],
            weight: item.weight,
            unit: item.unit,
            amount: `${item.weight || 0} ${item.unit || 'кг'}`,
            details: {
              description: item.characteristics || "",
              priority: "Середній"
            }
          };
          handleSave(updatedRow);
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={editingRow ? {
          id: editingRow.id,
          name: editingRow.name,
          contactInfo: editingRow.details?.description
        } : null}
        onSave={(client) => {
          const updatedRow: DataRow = {
            id: client.id,
            name: client.name,
            status: "Активний",
            date: new Date().toLocaleDateString('uk-UA'),
            details: {
              description: client.contactInfo || "",
              priority: "Середній"
            }
          };
          handleSave(updatedRow);
        }}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSave={handleSave}
        theme={theme}
        materials={materials}
        onMaterialAdd={onMaterialAdd}
        clients={clients}
      />

      <SubOrderModal 
        isOpen={isSubOrderModalOpen}
        onClose={() => {
          setIsSubOrderModalOpen(false);
          setEditingSubOrder(null);
          setCurrentOrderId("");
        }}
        row={editingSubOrder}
        onSave={handleSubOrderSave}
        theme={theme}
        materials={materials}
        onMaterialAdd={onMaterialAdd}
      />

      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => {
          setIsAddMaterialModalOpen(false);
          setSelectedMaterialForAdd("");
        }}
        onAddWeight={handleAddMaterialWeight}
        materialName={materials.find(m => m.id === selectedMaterialForAdd)?.name || ""}
        theme={theme}
      />
    </div>
  );
}