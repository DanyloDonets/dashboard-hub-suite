import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  type: "phone" | "email";
  value: string;
}

interface Client {
  id: string;
  name: string;
  contactInfo?: string;
  contacts?: Contact[];
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
    contactInfo: "",
    contacts: []
  });
  
  const { toast } = useToast();

  // Підтягуємо дані при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          ...client,
          contactInfo: client.contactInfo || "",
          contacts: client.contacts || []
        });
      } else {
        setFormData({
          id: Date.now().toString(),
          name: "",
          contactInfo: "",
          contacts: []
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

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      type: "phone",
      value: ""
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact]
    }));
  };

  const updateContact = (contactIndex: number, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: (prev.contacts || []).map((contact, index) => 
        index === contactIndex ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (contactIndex: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter((_, index) => index !== contactIndex)
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
            <div className="flex items-center justify-between mb-2">
              <Label>Контакти:</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addContact}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Додати контакт
              </Button>
            </div>
            
            {formData.contacts && formData.contacts.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.contacts.map((contact, contactIndex) => (
                  <div key={contact.id} className="flex items-center gap-2 p-2 border rounded">
                    <select
                      value={contact.type}
                      onChange={(e) => updateContact(contactIndex, 'type', e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                    >
                      <option value="phone">Телефон</option>
                      <option value="email">Email</option>
                    </select>
                    <Input
                      type="text"
                      value={contact.value}
                      onChange={(e) => updateContact(contactIndex, 'value', e.target.value)}
                      className="flex-1 text-sm"
                      placeholder={contact.type === 'phone' ? '+380...' : 'email@domain.com'}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeContact(contactIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Контакти відсутні</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactInfo">Додаткова контактна інформація</Label>
            <Textarea
              id="contactInfo"
              value={formData.contactInfo || ''}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Адреса, додаткові деталі, тощо..."
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