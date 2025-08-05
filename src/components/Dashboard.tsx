import { useState } from "react";
import { TabNavigation, type TabType } from "./TabNavigation";
import { DataTable } from "./DataTable";
import { LogsTab } from "./LogsTab";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { logger } from "@/utils/logger";
import type { Material } from "./MaterialModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface DashboardProps {
  onLogout: () => void;
}

// Функція для отримання матеріалів з інвентарю
const getMaterialsFromInventory = (inventory: any[]) => {
  return inventory.map(item => ({
    id: item.id,
    name: item.name,
    weight: item.weight || 0,
    unit: item.unit || 'кг'
  }));
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const { data, loading, saveOrder, saveInventory, saveClient, saveSubOrder, deleteRecord } = useSupabaseData();
  const materialsData = getMaterialsFromInventory(data.inventory);

  const handleDataChange = (newData: any[]) => {
    // Ця функція тепер не потрібна, оскільки DataTable безпосередньо працює з БД
    logger.log(`Оновлення даних`, `Оновлено дані в розділі ${activeTab}`, "Користувач");
  };

  const handleMaterialAdd = async (materialId: string, weight: number) => {
    // Знаходимо матеріал в inventory
    const material = data.inventory.find((item: any) => item.id === materialId);
    if (!material) return;
    
    // Оновлюємо вагу в БД
    const updatedItem = {
      id: materialId,
      name: material.name,
      weight: (material.weight || 0) + weight,
      unit: material.unit,
      imageUrl: material.details.description
    };
    
    await saveInventory(updatedItem);
    logger.log("Додавання матеріалу", `${weight > 0 ? 'Додано' : 'Списано'} ${Math.abs(weight)} кг матеріалу ${materialId}`, "Користувач");
  };

  const getTabTitle = (tab: TabType) => {
    const titles = {
      orders: "Управління замовленнями",
      inventory: "Управління складом",
      clients: "Управління клієнтами",
      logs: "Журнал операцій"
    };
    return titles[tab];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold bg-gradient-${activeTab} bg-clip-text text-transparent`}>
                  DashBoard Suite
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">{getTabTitle(activeTab)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Завантаження...</div>
          </div>
        ) : activeTab === "logs" ? (
          <LogsTab theme={activeTab} />
        ) : (
          <DataTable 
            theme={activeTab}
            data={data[activeTab]}
            onDataChange={handleDataChange}
            materials={materialsData}
            onMaterialAdd={handleMaterialAdd}
            clients={data.clients}
            saveOrder={saveOrder}
            saveInventory={saveInventory}
            saveClient={saveClient}
            saveSubOrder={saveSubOrder}
            deleteRecord={deleteRecord}
          />
        )}
      </main>
    </div>
  );
}