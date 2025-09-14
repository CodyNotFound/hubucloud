/**
 * 简单的日志工具
 * 提供不同级别的日志记录功能
 */

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

class Logger {
    private currentLevel: LogLevel = LogLevel.INFO;

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    private log(level: LogLevel, levelName: string, message: string, ...args: any[]) {
        if (level >= this.currentLevel) {
            const formattedMessage = this.formatMessage(levelName, message);
            console.log(formattedMessage, ...args);
        }
    }

    debug(message: string, ...args: any[]) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }

    info(message: string, ...args: any[]) {
        this.log(LogLevel.INFO, 'INFO', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log(LogLevel.WARN, 'WARN', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log(LogLevel.ERROR, 'ERROR', message, ...args);
    }

    req(method: string, path: string, status: number, duration: number) {
        const message = `${method} ${path} ${status} ${duration}ms`;
        this.info(message);
    }

    setLevel(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') {
        this.currentLevel = LogLevel[level];
    }
}

export default new Logger();
