import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface Material {
  id: string;
  name: string;
  weight: number;
  unit: string;
}

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  onAddMaterial: (materialId: string, weight: number) => void;
  theme: string;
}

export function MaterialModal({ isOpen, onClose, materials, onAddMaterial, theme }: MaterialModalProps) {
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!selectedMaterial || !weight) {
      toast({
        title: "Помилка",
        description: "Оберіть матеріал та вкажіть вагу",
        variant: "destructive"
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Помилка", 
        description: "Введіть коректну вагу",
        variant: "destructive"
      });
      return;
    }

    onAddMaterial(selectedMaterial, weightNum);
    setSelectedMaterial("");
    setWeight("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-${theme} font-bold`}>
            Додати матеріал
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="material">Матеріал</Label>
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Оберіть матеріал" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} (в наявності: {material.weight} {material.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weight">Кількість</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Введіть кількість"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave} className={`bg-${theme} text-${theme}-foreground`}>
            Додати
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}