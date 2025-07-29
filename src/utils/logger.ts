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

  private saveToFile(entry: LogEntry) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `logs_${today}.txt`;
    
    const logLine = `[${entry.timestamp}] ${entry.user} - ${entry.action}: ${entry.details}\n`;
    
    // В реальному застосунку тут був би API запит на сервер
    // Зараз просто виводимо в консоль
    console.log(`LOG -> ${filename}: ${logLine.trim()}`);
    
    // Можна також зберігати в localStorage для демонстрації
    const existingLogs = localStorage.getItem(filename) || "";
    localStorage.setItem(filename, existingLogs + logLine);
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