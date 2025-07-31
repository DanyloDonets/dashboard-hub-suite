import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubOrderModal } from "./SubOrderModal";
import type { Material } from "./MaterialModal";

interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;
  client?: string;
  clientId?: string;
  orderDate: string;
  deliveryDate: string;
  accountNumber: string;
  expenseNumber: string;
  executor: string;
  subOrders?: Array<{
    id: string;
    name: string;
    type: string;
    quantity: string;
    parameters: string;
    description: string;
    materials?: Array<{
      materialId: string;
      materialName: string;
      requiredWeight: number;
    }>;
    status: string;
    date: string;
    details: {
      description: string;
      priority: string;
      assignee?: string;
    };
  }>;
  details: {
    description: string;
    priority: string;
    assignee?: string;
  };
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newOrder: DataRow) => void;
  theme: string;
  materials?: Material[];
  onMaterialAdd?: (materialId: string, weight: number) => void;
  clients?: any[];
}

export function NewOrderModal({ isOpen, onClose, onSave, theme, materials = [], onMaterialAdd, clients = [] }: NewOrderModalProps) {
  const [formData, setFormData] = useState<DataRow>({
    id: Date.now().toString(),
    name: "",
    status: "Активний",
    date: new Date().toLocaleDateString('uk-UA'),
    amount: "",
    client: "",
    clientId: "",
    orderDate: new Date().toLocaleDateString('uk-UA'),
    deliveryDate: "-",
    accountNumber: "",
    expenseNumber: "",
    executor: "",
    subOrders: [],
    details: {
      description: "",
      priority: "Середній",
      assignee: ""
    }
  });

  const [subOrderModalOpen, setSubOrderModalOpen] = useState(false);
  const [editingSubOrderIndex, setEditingSubOrderIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('details.')) {
      const detailField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      client: selectedClient?.name || ""
    }));
  };

  const addSubOrder = () => {
    setEditingSubOrderIndex(null);
    setSubOrderModalOpen(true);
  };

  const editSubOrder = (index: number) => {
    setEditingSubOrderIndex(index);
    setSubOrderModalOpen(true);
  };

  const handleSubOrderSave = (subOrderData: any) => {
    const newSubOrder = {
      id: Date.now().toString(),
      name: subOrderData.name,
      type: subOrderData.type || "",
      quantity: subOrderData.quantity || "",
      parameters: subOrderData.parameters || "",
      description: subOrderData.details.description,
      materials: subOrderData.materials || [],
      status: subOrderData.status,
      date: subOrderData.date,
      details: subOrderData.details
    };

    if (editingSubOrderIndex !== null) {
      setFormData(prev => ({
        ...prev,
        subOrders: prev.subOrders?.map((sub, i) => i === editingSubOrderIndex ? newSubOrder : sub) || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subOrders: [...(prev.subOrders || []), newSubOrder]
      }));
    }
  };

  const removeSubOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subOrders: prev.subOrders?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Помилка",
        description: "Назва замовлення не може бути пустою",
        variant: "destructive"
      });
      return;
    }

    if (!formData.clientId) {
      toast({
        title: "Помилка",
        description: "Оберіть клієнта",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
    
    // Очищення форми
    setFormData({
      id: Date.now().toString(),
      name: "",
      status: "Активний",
      date: new Date().toLocaleDateString('uk-UA'),
      amount: "",
      client: "",
      clientId: "",
      orderDate: new Date().toLocaleDateString('uk-UA'),
      deliveryDate: "-",
      accountNumber: "",
      expenseNumber: "",
      executor: "",
      subOrders: [],
      details: {
        description: "",
        priority: "Середній",
        assignee: ""
      }
    });

    toast({
      title: "Збережено",
      description: "Замовлення успішно створено"
    });
  };

  const getSubOrderForEdit = () => {
    if (editingSubOrderIndex !== null && formData.subOrders) {
      return formData.subOrders[editingSubOrderIndex];
    }
    return null;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-${theme} font-bold text-xl`}>
              Нове замовлення
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Дані для замовлення */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Дані для замовлення</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Назва замовлення *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="orderDate">Дата замовлення *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate.split('.').reverse().join('-')}
                    onChange={(e) => handleInputChange('orderDate', new Date(e.target.value).toLocaleDateString('uk-UA'))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deliveryDate">Дата відвантаження</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate !== "-" ? formData.deliveryDate.split('.').reverse().join('-') : ""}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value ? new Date(e.target.value).toLocaleDateString('uk-UA') : "-")}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="client">Замовник *</Label>
                  <Select value={formData.clientId || ""} onValueChange={handleClientChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Оберіть клієнта" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="accountNumber">Номер рахунку</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expenseNumber">№ видаткова</Label>
                  <Input
                    id="expenseNumber"
                    value={formData.expenseNumber}
                    onChange={(e) => handleInputChange('expenseNumber', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="executor">Виконавець</Label>
                  <Input
                    id="executor"
                    value={formData.executor}
                    onChange={(e) => handleInputChange('executor', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Підзамовлення */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Підзамовлення</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubOrder}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Додати підзамовлення
                </Button>
              </div>
              
              {formData.subOrders && formData.subOrders.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.subOrders.map((subOrder, index) => (
                    <div key={subOrder.id} className="flex items-start justify-between p-3 border rounded bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium">{subOrder.name || "Без назви"}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Тип: {subOrder.type} | Кількість: {subOrder.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Параметри: {subOrder.parameters}
                        </div>
                        {subOrder.materials && subOrder.materials.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Матеріали: {subOrder.materials.map(m => `${m.materialName} (${m.requiredWeight} кг)`).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editSubOrder(index)}
                        >
                          Редагувати
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSubOrder(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button onClick={handleSave} className={`bg-${theme} text-${theme}-foreground`}>
              Створити замовлення
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubOrderModal 
        isOpen={subOrderModalOpen}
        onClose={() => {
          setSubOrderModalOpen(false);
          setEditingSubOrderIndex(null);
        }}
        row={getSubOrderForEdit()}
        onSave={handleSubOrderSave}
        theme={theme}
        materials={materials}
        onMaterialAdd={onMaterialAdd}
      />
    </>
  );
}