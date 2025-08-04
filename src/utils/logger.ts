export interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

class Logger {
  private logs: LogEntry[] = [];

  log(action: string, details: string, user: string = "Користувач") {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    };
    
    this.logs.push(entry);
    this.saveToFile(entry);
  }

  private async saveToFile(entry: LogEntry) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `logs_${today}.txt`;
    
    const logLine = `[${entry.timestamp}] ${entry.user} - ${entry.action}: ${entry.details}\n`;
    
    // Зберігаємо в localStorage для txt файлу
    const existingLogs = localStorage.getItem(filename) || "";
    localStorage.setItem(filename, existingLogs + logLine);
    
    // Зберігаємо в базу даних
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await (supabase as any).from('logs').insert({
        action: entry.action,
        details: entry.details
      });
    } catch (error) {
      console.error('Помилка збереження логу в БД:', error);
    }
    
    console.log(`LOG -> ${filename}: ${logLine.trim()}`);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getTodayLogs(): LogEntry[] {
    const today = new Date().toISOString().split('T')[0];
    return this.logs.filter(log => log.timestamp.startsWith(today));
  }
}

export const logger = new Logger();