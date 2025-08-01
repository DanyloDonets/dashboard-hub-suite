import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  weight?: number;
  unit?: string;
  characteristics?: string;
  lastUpdated?: string;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
}

export function InventoryModal({ isOpen, onClose, item, onSave }: InventoryModalProps) {
  const [formData, setFormData] = useState<InventoryItem>({
    id: "",
    name: "",
    weight: 0,
    unit: "кг",
    characteristics: "",
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();

  // Підтягуємо дані при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          ...item,
          characteristics: item.characteristics || "",
          weight: item.weight || 0,
          unit: item.unit || "кг"
        });
      } else {
        setFormData({
          id: Date.now().toString(),
          name: "",
          weight: 0,
          unit: "кг",
          characteristics: "",
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, item]);

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString().split('T')[0] // Оновлюємо дату при зміні
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Помилка",
        description: "Назва матеріалу не може бути пустою",
        variant: "destructive"
      });
      return;
    }

    if (!formData.weight || formData.weight <= 0) {
      toast({
        title: "Помилка", 
        description: "Кількість повинна бути більше 0",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
    toast({
      title: "Збережено",
      description: "Матеріал успішно збережено"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Редагувати матеріал' : 'Додати матеріал'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Назва матеріалу *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1"
              placeholder="Наприклад: Сталь листова"
            />
          </div>

          <div>
            <Label htmlFor="characteristics">Характеристики матеріалу</Label>
            <Textarea
              id="characteristics"
              value={formData.characteristics || ''}
              onChange={(e) => handleInputChange('characteristics', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Розмір, товщина, марка сталі, тощо..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Кількість *</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight || 0}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unit">Одиниця виміру</Label>
              <Input
                id="unit"
                value={formData.unit || 'кг'}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="mt-1"
                placeholder="кг, м, шт"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastUpdated">Дата останнього оновлення</Label>
            <Input
              id="lastUpdated"
              type="date"
              value={formData.lastUpdated}
              onChange={(e) => handleInputChange('lastUpdated', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}