import { useState } from "react";
import { TabNavigation, type TabType } from "./TabNavigation";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoImage from "@/assets/logo.png";

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
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      subOrders: [
        {
          id: "1-1",
          name: "Підзамовлення #001-A",
          status: "В процесі",
          date: "2024-01-16",
          amount: "500 грн",
          image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
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
      name: "Товар А",
      status: "В наявності",
      date: "2024-01-15",
      amount: "150 шт",
      details: {
        description: "Основний товар категорії А",
        priority: "Високий",
        assignee: "Склад #1"
      }
    },
    {
      id: "2", 
      name: "Товар Б",
      status: "Закінчується",
      date: "2024-01-10",
      amount: "25 шт",
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
      details: {
        description: "Новий клієнт, перша співпраця",
        priority: "Середній",
        assignee: "Ольга Сидорова"
      }
    }
  ],
  finance: [
    {
      id: "1",
      name: "Дохід січень",
      status: "Підтверджено",
      date: "2024-01-31",
      amount: "+25,000 грн",
      details: {
        description: "Загальний дохід за січень",
        priority: "Високий",
        assignee: "Фінансовий відділ"
      }
    },
    {
      id: "2",
      name: "Витрати на рекламу",
      status: "Оплачено",
      date: "2024-01-15",
      amount: "-3,500 грн",
      details: {
        description: "Витрати на онлайн рекламу",
        priority: "Середній",
        assignee: "Маркетинг"
      }
    }
  ]
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [data, setData] = useState(initialData);

  const handleDataChange = (newData: any[]) => {
    setData(prev => ({
      ...prev,
      [activeTab]: newData
    }));
  };

  const getTabTitle = (tab: TabType) => {
    const titles = {
      orders: "Управління замовленнями",
      inventory: "Управління складом",
      clients: "Управління клієнтами",
      finance: "Фінансовий облік"
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
        />
      </main>
    </div>
  );
}