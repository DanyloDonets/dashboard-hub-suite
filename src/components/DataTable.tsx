import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, CheckCircle, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TabType } from "./TabNavigation";

interface DataRow {
  id: string;
  name: string;
  status: string;
  date: string;
  amount?: string;
  details: {
    description: string;
    priority: string;
    assignee?: string;
  };
}

interface DataTableProps {
  theme: TabType;
  data: DataRow[];
  onDataChange: (data: DataRow[]) => void;
}

export function DataTable({ theme, data, onDataChange }: DataTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    toast({
      title: "Редагування",
      description: `Редагування запису з ID: ${id}`,
    });
  };

  const handleDelete = (id: string) => {
    const newData = data.filter(row => row.id !== id);
    onDataChange(newData);
    toast({
      title: "Видалено",
      description: "Запис успішно видалено",
    });
  };

  const handleComplete = (id: string) => {
    const newData = data.map(row => 
      row.id === id ? { ...row, status: "Завершено" } : row
    );
    onDataChange(newData);
    toast({
      title: "Завершено",
      description: "Замовлення успішно завершено",
    });
  };

  const addNewRow = () => {
    const newRow: DataRow = {
      id: (data.length + 1).toString(),
      name: `Новий запис ${data.length + 1}`,
      status: "Активний",
      date: new Date().toLocaleDateString('uk-UA'),
      amount: "0 грн",
      details: {
        description: "Опис нового запису",
        priority: "Середній",
        assignee: "Не призначено"
      }
    };
    onDataChange([...data, newRow]);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={addNewRow}
          className={`bg-${theme} text-${theme}-foreground hover:opacity-90 shadow-${theme}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Додати новий
        </Button>
        <Button variant="outline">
          Імпорт
        </Button>
        <Button variant="outline">
          Експорт
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-${theme}-muted border-b`}>
                <tr>
                  <th className="text-left p-4 font-medium">Назва</th>
                  <th className="text-left p-4 font-medium">Статус</th>
                  <th className="text-left p-4 font-medium">Дата</th>
                  <th className="text-left p-4 font-medium">Сума</th>
                  <th className="text-left p-4 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <>
                    <tr 
                      key={row.id}
                      className={`
                        border-b hover:bg-${theme}-muted/30 cursor-pointer transition-colors
                        ${expandedRow === row.id ? `bg-${theme}-muted/50` : ''}
                      `}
                      onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {expandedRow === row.id ? 
                            <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                          {row.name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${row.status === 'Завершено' 
                            ? `bg-${theme}-accent text-${theme}` 
                            : `bg-${theme}-secondary text-${theme}`
                          }
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{row.date}</td>
                      <td className="p-4 font-medium">{row.amount}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(row.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(row.id);
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === row.id && (
                      <tr className={`bg-${theme}-muted/20`}>
                        <td colSpan={5} className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-2">Додаткова інформація</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Опис:</span>
                                  <p className="mt-1">{row.details.description}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Пріоритет:</span>
                                  <p className="mt-1">{row.details.priority}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Відповідальний:</span>
                                  <p className="mt-1">{row.details.assignee}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                className={`bg-${theme} text-${theme}-foreground`}
                                onClick={() => handleEdit(row.id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Редагувати
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(row.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Видалити
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleComplete(row.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Завершити замовлення
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}