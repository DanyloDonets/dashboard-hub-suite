import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { logger, type LogEntry } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

interface LogsTabProps {
  theme: string;
}

export function LogsTab({ theme }: LogsTabProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Завантажуємо логи при ініціалізації
    const loadLogs = async () => {
      try {
        // Завантажуємо з бази даних
        const { data: dbLogs, error } = await (supabase as any).from('logs').select('*').order('created_at', { ascending: false });
        
        if (!error && dbLogs) {
          const transformedLogs = dbLogs.map((log: any) => ({
            timestamp: log.created_at,
            action: log.action,
            details: log.details,
            user: "Користувач"
          }));
          setLogs(transformedLogs);
        }
        
        // Також додаємо локальні логи
        const localLogs = logger.getLogs();
        if (localLogs.length > 0) {
          setLogs(prev => [...localLogs.reverse(), ...prev]);
        }
      } catch (error) {
        console.error('Помилка завантаження логів:', error);
        // Fallback до локальних логів
        const allLogs = logger.getLogs();
        setLogs(allLogs.reverse());
      }
    };

    loadLogs();
    
    // Оновлюємо логи кожні 5 секунд
    const interval = setInterval(loadLogs, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const clearLogs = async () => {
    try {
      // Очищуємо логи з бази даних
      await (supabase as any).from('logs').delete().gte('id', 0);
      
      // Очищуємо логи з localStorage
      const today = new Date().toISOString().split('T')[0];
      const filename = `logs_${today}.txt`;
      localStorage.removeItem(filename);
      
      setLogs([]);
    } catch (error) {
      console.error('Помилка очищення логів:', error);
    }
  };

  const downloadLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `logs_${today}.txt`;
    const logsContent = localStorage.getItem(filename) || "";
    
    const blob = new Blob([logsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogTypeColor = (action: string) => {
    if (action.includes('створення') || action.includes('додавання')) return 'secondary';
    if (action.includes('видалення')) return 'destructive';
    if (action.includes('редагування') || action.includes('оновлення')) return 'secondary';
    if (action.includes('відкриття')) return 'outline';
    return 'default';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('uk-UA');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-${theme}`}>Логи системи</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Завантажити
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearLogs}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Очистити
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Журнал операцій</span>
            <Badge variant="outline">{logs.length} записів</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Логи відсутні
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Badge variant={getLogTypeColor(log.action)} className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {log.user}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}