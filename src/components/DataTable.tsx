import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, CheckCircle, ChevronDown, ChevronUp, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditModal } from "./EditModal";
import type { TabType } from "./TabNavigation";

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

interface DataTableProps {
  theme: TabType;
  data: DataRow[];
  onDataChange: (data: DataRow[]) => void;
}

export function DataTable({ theme, data, onDataChange }: DataTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    const row = data.find(r => r.id === id);
    if (row) {
      setEditingRow(row);
      setEditModalOpen(true);
    }
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
    setEditingRow(null);
    setEditModalOpen(true);
  };

  const handleSaveRow = (updatedRow: DataRow) => {
    if (editingRow) {
      // Редагування існуючого запису
      const newData = data.map(row => 
        row.id === editingRow.id ? updatedRow : row
      );
      onDataChange(newData);
    } else {
      // Додавання нового запису
      const newRow = {
        ...updatedRow,
        id: (Math.max(...data.map(r => parseInt(r.id)), 0) + 1).toString(),
      };
      onDataChange([...data, newRow]);
    }
  };

  const openImageInNewTab = (imageUrl: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
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
                  <th className="text-left p-2 md:p-4 font-medium">Назва</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden sm:table-cell">Статус</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden md:table-cell">Дата</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden md:table-cell">Сума</th>
                  {(theme === 'orders' || theme === 'finance') && (
                    <th className="text-left p-2 md:p-4 font-medium hidden lg:table-cell">Зображення</th>
                  )}
                  <th className="text-left p-2 md:p-4 font-medium">Дії</th>
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
                      <td className="p-2 md:p-4">
                        <div className="flex items-center gap-2">
                          {expandedRow === row.id ? 
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : 
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          }
                          <span className="truncate">{row.name}</span>
                        </div>
                        {/* Mobile info */}
                        <div className="sm:hidden mt-1 text-xs text-muted-foreground space-y-1">
                          <div>Статус: <span className={`px-1 py-0.5 rounded text-xs ${row.status === 'Завершено' ? `bg-${theme}-accent text-${theme}` : `bg-${theme}-secondary text-${theme}`}`}>{row.status}</span></div>
                          <div>Дата: {row.date}</div>
                          {row.amount && <div>Сума: {row.amount}</div>}
                        </div>
                      </td>
                      <td className="p-2 md:p-4 hidden sm:table-cell">
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
                      <td className="p-2 md:p-4 text-muted-foreground hidden md:table-cell">{row.date}</td>
                      <td className="p-2 md:p-4 font-medium hidden md:table-cell">{row.amount}</td>
                      {(theme === 'orders' || theme === 'finance') && (
                        <td className="p-2 md:p-4 hidden lg:table-cell">
                          {row.image && (
                            <div className="flex items-center gap-2">
                              <img 
                                src={row.image} 
                                alt="Зображення" 
                                className="w-8 h-8 object-cover rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openImageInNewTab(row.image!);
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openImageInNewTab(row.image!);
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="p-2 md:p-4">
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
                            className="hidden sm:inline-flex"
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
                            className="hidden md:inline-flex"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === row.id && (
                      <tr className={`bg-${theme}-muted/20`}>
                        <td colSpan={(theme === 'orders' || theme === 'finance') ? 6 : 5} className="p-2 md:p-4">
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
                                {row.image && (theme === 'orders' || theme === 'finance') && (
                                  <div className="md:col-span-3">
                                    <span className="text-muted-foreground">Зображення:</span>
                                    <div className="mt-2 flex items-center gap-2">
                                      <img 
                                        src={row.image} 
                                        alt="Зображення" 
                                        className="w-20 h-20 object-cover rounded cursor-pointer border"
                                        onClick={() => openImageInNewTab(row.image!)}
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openImageInNewTab(row.image!)}
                                        className="gap-1"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Відкрити у новій вкладці
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
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

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        row={editingRow}
        onSave={handleSaveRow}
        theme={theme}
      />
    </div>
  );
}