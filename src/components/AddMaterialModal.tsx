import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWeight: (weight: number) => void;
  materialName: string;
  theme: string;
}

export function AddMaterialModal({ isOpen, onClose, onAddWeight, materialName, theme }: AddMaterialModalProps) {
  const [weight, setWeight] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Помилка",
        description: "Введіть коректну вагу",
        variant: "destructive"
      });
      return;
    }

    onAddWeight(weightNum);
    setWeight("");
    onClose();
    toast({
      title: "Додано",
      description: `Додано ${weightNum} кг до матеріалу ${materialName}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-${theme} font-bold`}>
            Додати матеріал: {materialName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="weight">Скільки ваги додати?</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Введіть вагу в кг"
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