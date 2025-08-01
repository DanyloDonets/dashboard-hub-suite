import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  contactInfo?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (client: Client) => void;
}

export function ClientModal({ isOpen, onClose, client, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState<Client>({
    id: "",
    name: "",
    contactInfo: ""
  });
  
  const { toast } = useToast();

  // Підтягуємо дані при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          ...client,
          contactInfo: client.contactInfo || ""
        });
      } else {
        setFormData({
          id: Date.now().toString(),
          name: "",
          contactInfo: ""
        });
      }
    }
  }, [isOpen, client]);

  const handleInputChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Помилка",
        description: "Назва компанії не може бути пустою",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
    toast({
      title: "Збережено",
      description: "Клієнт успішно збережений"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Редагувати клієнта' : 'Додати клієнта'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Назва компанії *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1"
              placeholder="Наприклад: ТОВ 'Будівельна компанія'"
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Контактна інформація</Label>
            <Textarea
              id="contactInfo"
              value={formData.contactInfo || ''}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Телефон, email, адреса, контактна особа, тощо..."
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