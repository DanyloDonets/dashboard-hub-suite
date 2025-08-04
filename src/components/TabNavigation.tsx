import { Button } from "@/components/ui/button";

export type TabType = "orders" | "inventory" | "clients" | "logs";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "orders" as const, label: "Замовлення", theme: "orders" },
  { id: "inventory" as const, label: "Склад", theme: "inventory" },
  { id: "clients" as const, label: "Клієнти", theme: "clients" },
  { id: "logs" as const, label: "Логи", theme: "logs" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={`
                h-10 sm:h-12 px-3 sm:px-6 rounded-b-none border-b-2 transition-all duration-300 whitespace-nowrap text-sm sm:text-base flex-shrink-0
                ${activeTab === tab.id 
                  ? `bg-${tab.theme} text-${tab.theme}-foreground border-${tab.theme} shadow-${tab.theme}` 
                  : `border-transparent hover:bg-${tab.theme}-muted hover:border-${tab.theme}-accent`
                }
              `}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}