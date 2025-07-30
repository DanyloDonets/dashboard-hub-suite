import { useState } from "react";
import { TabNavigation, type TabType } from "./TabNavigation";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { logger } from "@/utils/logger";
import type { Material } from "./MaterialModal";

interface DashboardProps {
  onLogout: () => void;
}

const initialData = {
  orders: [
    {
      id: "1",
      name: "Замовлення #001",
      status: "В процесі",
      date: "2024-01-15",
      amount: "1,250 грн",
      client: "ТОВ \"Компанія А\"",
      subOrders: [
        {
          id: "1-1",
          name: "Підзамовлення #001-A",
          status: "В процесі",
          date: "2024-01-16",
          amount: "500 грн",
          image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
          materials: [
            { materialId: "1", materialName: "Алюміній", requiredWeight: 50, weight: 50, needed: 50, status: "sufficient" as const }
          ],
          details: {
            description: "Частина основного замовлення - комплектуючі",
            priority: "Високий",
            assignee: "Петро Сидоров"
          }
        },
        {
          id: "1-2",
          name: "Підзамовлення #001-B",
          status: "Завершено",
          date: "2024-01-17",
          amount: "750 грн",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
          materials: [
            { materialId: "2", materialName: "Сталь", requiredWeight: 30, weight: 30, needed: 30, status: "sufficient" as const }
          ],
          details: {
            description: "Доставка та монтаж",
            priority: "Середній",
            assignee: "Олена Ткач"
          }
        }
      ],
      details: {
        description: "Замовлення на поставку товарів",
        priority: "Високий",
        assignee: "Іван Петров"
      }
    },
    {
      id: "2",
      name: "Замовлення #002",
      status: "Завершено",
      date: "2024-01-14",
      amount: "850 грн",
      client: "ФОП Петренко",
      subOrders: [],
      details: {
        description: "Термінове замовлення",
        priority: "Середній",
        assignee: "Марія Іванова"
      }
    }
  ],
  inventory: [
    {
      id: "1",
      name: "Сталь листова",
      status: "В наявності",
      date: "2024-01-15",
      amount: "150 кг",
      weight: 150,
      unit: "кг",
      details: {
        description: "Основний товар категорії А",
        priority: "Високий",
        assignee: "Склад #1"
      }
    },
    {
      id: "2", 
      name: "Алюміній профільний",
      status: "Закінчується",
      date: "2024-01-10",
      amount: "25 кг",
      weight: 25,
      unit: "кг",
      details: {
        description: "Товар потребує поповнення",
        priority: "Високий",
        assignee: "Склад #2"
      }
    }
  ],
  clients: [
    {
      id: "1",
      name: "ТОВ \"Компанія А\"",
      status: "Активний",
      date: "2024-01-01",
      amount: "15,000 грн",
      contacts: [
        { id: "1-1", type: "phone" as const, value: "+380501234567" },
        { id: "1-2", type: "email" as const, value: "info@company-a.com" },
        { id: "1-3", type: "phone" as const, value: "+380677654321" }
      ],
      details: {
        description: "Постійний клієнт з великим оборотом",
        priority: "Високий",
        assignee: "Андрій Коваль"
      }
    },
    {
      id: "2",
      name: "ФОП Петренко",
      status: "Новий",
      date: "2024-01-12",
      amount: "2,500 грн",
      contacts: [
        { id: "2-1", type: "phone" as const, value: "+380631111111" },
        { id: "2-2", type: "email" as const, value: "petrenko@email.com" }
      ],
      details: {
        description: "Новий клієнт, перша співпраця",
        priority: "Середній",
        assignee: "Ольга Сидорова"
      }
    }
  ]
};

const materials: Material[] = [
  { id: "1", name: "Сталь листова", weight: 150, unit: "кг" },
  { id: "2", name: "Алюміній профільний", weight: 25, unit: "кг" }
];

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [data, setData] = useState(initialData);
  const [materialsData, setMaterialsData] = useState(materials);

  const handleDataChange = (newData: any[]) => {
    setData(prev => ({
      ...prev,
      [activeTab]: newData
    }));
    logger.log(`Оновлення даних`, `Оновлено дані в розділі ${activeTab}`, "Користувач");
  };

  const handleMaterialAdd = (materialId: string, weight: number) => {
    setMaterialsData(prev => prev.map(material => 
      material.id === materialId 
        ? { ...material, weight: material.weight + weight }
        : material
    ));
    logger.log("Додавання матеріалу", `Додано ${weight} кг матеріалу ${materialId}`, "Користувач");
  };

  const getTabTitle = (tab: TabType) => {
    const titles = {
      orders: "Управління замовленнями",
      inventory: "Управління складом",
      clients: "Управління клієнтами"
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
        <DataTable 
          theme={activeTab}
          data={data[activeTab]}
          onDataChange={handleDataChange}
          materials={materialsData}
          onMaterialAdd={handleMaterialAdd}
          clients={data.clients}
        />
      </main>
    </div>
  );
}