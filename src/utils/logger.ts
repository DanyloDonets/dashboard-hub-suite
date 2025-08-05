export interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
  user: string;
  level?: 'info' | 'warn' | 'error';
}

class Logger {
  private logs: LogEntry[] = [];

  log(action: string, details: string, user: string = "Користувач", level: 'info' | 'warn' | 'error' = 'info') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user,
      level
    };
    
    this.logs.push(entry);
    this.saveToFile(entry);
  }

  error(action: string, details: string, user: string = "Система") {
    this.log(action, details, user, 'error');
  }

  warn(action: string, details: string, user: string = "Система") {
    this.log(action, details, user, 'warn');
  }

  private async saveToFile(entry: LogEntry) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `logs_${today}.txt`;
    
    const levelPrefix = entry.level ? `[${entry.level.toUpperCase()}]` : '[INFO]';
    const logLine = `${levelPrefix} [${entry.timestamp}] ${entry.user} - ${entry.action}: ${entry.details}\n`;
    
    // Зберігаємо в localStorage для txt файлу
    const existingLogs = localStorage.getItem(filename) || "";
    localStorage.setItem(filename, existingLogs + logLine);
    
    // Зберігаємо в базу даних
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await (supabase as any).from('logs').insert({
        action: `${levelPrefix} ${entry.action}`,
        details: entry.details
      });
    } catch (error) {
      console.error('Помилка збереження логу в БД:', error);
    }
    
    // Виводимо в консоль відповідно до рівня
    const consoleLog = `LOG -> ${filename}: ${logLine.trim()}`;
    if (entry.level === 'error') {
      console.error(consoleLog);
    } else if (entry.level === 'warn') {
      console.warn(consoleLog);
    } else {
      console.log(consoleLog);
    }
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