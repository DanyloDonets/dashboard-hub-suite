import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;
  clientId?: string;
  subOrders?: DataRow[];
  materials?: Array<{
    materialId: string;
    materialName: string;
    requiredWeight: number;
  }>;
  details: {
    description: string;
    priority: string;
    assignee?: string;
  };
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: DataRow | null;
  onSave: (updatedRow: DataRow) => void;
  theme: string;
  isSubOrder?: boolean;
  materials?: any[];
  onMaterialAdd?: (materialId: string, weight: number) => void;
  clients?: any[];
}

export function EditModal({ isOpen, onClose, row, onSave, theme, isSubOrder = false, materials = [], onMaterialAdd, clients = [] }: EditModalProps) {
  const [formData, setFormData] = useState<DataRow>({
    id: "",
    name: "",
    status: "Активний", 
    date: new Date().toLocaleDateString('uk-UA'),
    amount: "",
    image: "",
    clientId: "",
    subOrders: [],
    materials: [],
    details: {
      description: "",
      priority: "Середній",
      assignee: ""
    }
  });

  // Підтягуємо дані при відкритті модального вікна
  useEffect(() => {
    if (isOpen && row) {
      setFormData({
        ...row,
        details: {
          description: row.details?.description || "",
          priority: row.details?.priority || "Середній",
          assignee: row.details?.assignee || ""
        },
        subOrders: row.subOrders || [],
        materials: row.materials || []
      });
    } else if (isOpen && !row) {
      setFormData({
        id: Date.now().toString(),
        name: "",
        status: "Активний", 
        date: new Date().toLocaleDateString('uk-UA'),
        amount: "",
        image: "",
        clientId: "",
        subOrders: [],
        materials: [],
        details: {
          description: "",
          priority: "Середній",
          assignee: ""
        }
      });
    }
  }, [isOpen, row]);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubOrder = () => {
    const newSubOrder: DataRow = {
      id: Date.now().toString(),
      name: "",
      status: "Активний",
      date: new Date().toLocaleDateString('uk-UA'),
      amount: "",
      image: "",
      materials: [],
      details: {
        description: "",
        priority: "Середній",
        assignee: ""
      }
    };
    
    setFormData(prev => ({
      ...prev,
      subOrders: [...(prev.subOrders || []), newSubOrder]
    }));
  };

  const updateSubOrder = (index: number, updatedSubOrder: DataRow) => {
    setFormData(prev => ({
      ...prev,
      subOrders: prev.subOrders?.map((sub, i) => i === index ? updatedSubOrder : sub) || []
    }));
  };

  const removeSubOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subOrders: prev.subOrders?.filter((_, i) => i !== index) || []
    }));
  };

  const addMaterialToSubOrder = (subOrderIndex: number, materialId: string, materialName: string, weight: number) => {
    setFormData(prev => {
      const updatedSubOrders = [...(prev.subOrders || [])];
      if (!updatedSubOrders[subOrderIndex].materials) {
        updatedSubOrders[subOrderIndex].materials = [];
      }
      updatedSubOrders[subOrderIndex].materials!.push({
        materialId,
        materialName,
        requiredWeight: weight
      });
      
      return {
        ...prev,
        subOrders: updatedSubOrders
      };
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Помилка",
        description: "Назва не може бути пустою",
        variant: "destructive"
      });
      return;
    }

    if (!isSubOrder && !formData.clientId) {
      toast({
        title: "Помилка",
        description: "Оберіть клієнта",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
    toast({
      title: "Збережено",
      description: "Дані успішно оновлені"
    });
  };

  const openImageInNewTab = () => {
    if (formData.image) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<img src="${formData.image}" style="max-width: 100%; height: auto;" />`);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-${theme} font-bold`}>
            {row ? 'Редагувати запис' : 'Новий запис'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Назва *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
              />
            </div>
            {!isSubOrder && (
              <div>
                <Label htmlFor="client">Клієнт *</Label>
                <Select value={formData.clientId || ""} onValueChange={(value) => handleInputChange('clientId', value)}>
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
            )}
            <div>
              <Label htmlFor="amount">Сума</Label>
              <Input
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Активний">Активний</SelectItem>
                  <SelectItem value="В процесі">В процесі</SelectItem>
                  <SelectItem value="Завершено">Завершено</SelectItem>
                  <SelectItem value="Призупинено">Призупинено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignee">Відповідальний</Label>
            <Input
              id="assignee"
              value={formData.details.assignee || ''}
              onChange={(e) => handleInputChange('details.assignee', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.details.description}
              onChange={(e) => handleInputChange('details.description', e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {isSubOrder && (
            <div>
              <Label>Зображення</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Завантажити зображення
                  </Button>
                  {formData.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openImageInNewTab}
                      className="gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Відкрити
                    </Button>
                  )}
                </div>
                {formData.image && (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded border cursor-pointer"
                      onClick={openImageInNewTab}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      onClick={() => handleInputChange('image', '')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isSubOrder && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Підзамовлення</Label>
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
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {formData.subOrders.map((subOrder, index) => (
                    <div key={subOrder.id} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                      <div className="flex-1">
                        <Input
                          value={subOrder.name}
                          onChange={(e) => updateSubOrder(index, { ...subOrder, name: e.target.value })}
                          placeholder="Назва підзамовлення"
                          className="mb-1"
                        />
                        <Textarea
                          value={subOrder.details.description}
                          onChange={(e) => updateSubOrder(index, { 
                            ...subOrder, 
                            details: { ...subOrder.details, description: e.target.value }
                          })}
                          placeholder="Опис підзамовлення"
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSubOrder(index)}
                        className="ml-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave} className={`bg-${theme} text-${theme}-foreground`}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}