import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  image?: string;
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
}

export function EditModal({ isOpen, onClose, row, onSave, theme }: EditModalProps) {
  const [formData, setFormData] = useState<DataRow>(
    row || {
      id: "",
      name: "",
      status: "Активний",
      date: new Date().toLocaleDateString('uk-UA'),
      amount: "",
      image: "",
      details: {
        description: "",
        priority: "Середній",
        assignee: ""
      }
    }
  );
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Помилка",
        description: "Назва не може бути пустою",
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
            <div>
              <Label htmlFor="priority">Пріоритет</Label>
              <Select value={formData.details.priority} onValueChange={(value) => handleInputChange('details.priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Низький">Низький</SelectItem>
                  <SelectItem value="Середній">Середній</SelectItem>
                  <SelectItem value="Високий">Високий</SelectItem>
                  <SelectItem value="Критичний">Критичний</SelectItem>
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
  );
}