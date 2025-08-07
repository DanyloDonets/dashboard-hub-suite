import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaterialModal, type Material } from "./MaterialModal";

interface DataRow {
  id: string;
  name: string;
  type?: string;
  quantity?: string;
  parameters?: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;
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

interface SubOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: DataRow | null;
  onSave: (updatedRow: DataRow) => void;
  theme: string;
  materials?: Material[];
  onMaterialAdd?: (materialId: string, weight: number) => void;
}

export function SubOrderModal({ isOpen, onClose, row, onSave, theme, materials = [], onMaterialAdd }: SubOrderModalProps) {
  const [formData, setFormData] = useState<DataRow>({
    id: "",
    name: "",
    type: "",
    quantity: "",
    parameters: "",
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
  });

  const [originalMaterials, setOriginalMaterials] = useState<Array<{materialId: string; materialName: string; requiredWeight: number;}>>([]);
  const [materialChanges, setMaterialChanges] = useState<{[key: string]: number}>({});

  // Підтягуємо дані при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      if (row) {
        const rowMaterials = row.materials || [];
        setFormData({
          ...row,
          materials: rowMaterials,
          details: {
            description: row.details?.description || "",
            priority: row.details?.priority || "Середній",
            assignee: row.details?.assignee || ""
          }
        });
        setOriginalMaterials([...rowMaterials]);
      } else {
        setFormData({
          id: Date.now().toString(),
          name: "",
          type: "",
          quantity: "",
          parameters: "",
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
        });
        setOriginalMaterials([]);
      }
      setMaterialChanges({});
    }
  }, [isOpen, row]);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
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

  const handleAddMaterial = (materialId: string, weight: number) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const newMaterial = {
      materialId,
      materialName: material.name,
      requiredWeight: weight
    };

    setFormData(prev => ({
      ...prev,
      materials: [...(prev.materials || []), newMaterial]
    }));

    // Тільки оновлюємо локальний стан змін матеріалів
    setMaterialChanges(prev => ({
      ...prev,
      [materialId]: (prev[materialId] || 0) - weight
    }));

    // НЕ закриваємо модальне вікно матеріалів автоматично
    // setMaterialModalOpen(false);
  };

  const removeMaterial = (index: number) => {
    const material = formData.materials?.[index];
    if (material) {
      // Тільки оновлюємо локальний стан змін матеріалів
      setMaterialChanges(prev => ({
        ...prev,
        [material.materialId]: (prev[material.materialId] || 0) + material.requiredWeight
      }));
    }

    setFormData(prev => ({
      ...prev,
      materials: prev.materials?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMaterialWeight = (index: number, newWeight: number) => {
    const material = formData.materials?.[index];
    if (!material || newWeight <= 0) return;

    const oldWeight = material.requiredWeight;
    const weightDifference = oldWeight - newWeight;

    // Оновлюємо зміни матеріалів
    setMaterialChanges(prev => ({
      ...prev,
      [material.materialId]: (prev[material.materialId] || 0) + weightDifference
    }));

    // Оновлюємо матеріал у формі
    setFormData(prev => ({
      ...prev,
      materials: prev.materials?.map((mat, i) => 
        i === index ? { ...mat, requiredWeight: newWeight } : mat
      ) || []
    }));
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

    // Тепер застосовуємо зміни матеріалів до складу
    if (onMaterialAdd) {
      Object.entries(materialChanges).forEach(([materialId, change]) => {
        if (change !== 0) {
          onMaterialAdd(materialId, change);
        }
      });
    }

    // Зберігаємо підзамовлення з усіма матеріалами
    const dataToSave = {
      ...formData,
      materials: formData.materials || []
    };

    onSave(dataToSave);
    onClose();
    toast({
      title: "Збережено",
      description: "Підзамовлення успішно оновлено"
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-${theme} font-bold`}>
              {row ? 'Редагувати підзамовлення' : 'Нове підзамовлення'}
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
              <div>
                <Label htmlFor="type">Вид</Label>
                <Input
                  id="type"
                  value={formData.type || ''}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Кількість</Label>
                <Input
                  id="quantity"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="parameters">Параметри</Label>
                <Input
                  id="parameters"
                  value={formData.parameters || ''}
                  onChange={(e) => handleInputChange('parameters', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Матеріали</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMaterialModalOpen(true)}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Додати матеріал
                </Button>
              </div>
              
              {formData.materials && formData.materials.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                      <div className="flex-1">
                        <span className="font-medium">{material.materialName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={material.requiredWeight}
                            onChange={(e) => updateMaterialWeight(index, parseFloat(e.target.value) || 0)}
                            className="w-20 h-7 text-sm"
                            min="0.1"
                            step="0.1"
                          />
                          <span className="text-sm text-muted-foreground">кг</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

      <MaterialModal 
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        materials={materials}
        onSelect={handleAddMaterial}
        theme={theme}
      />
    </>
  );
}