declare module 'process/browser' {
  const process: {
    env: { [key: string]: string | undefined };
    browser: boolean;
    version: string;
    versions: { [key: string]: string };
    platform: string;
    arch: string;
    pid: number;
    title: string;
    argv: string[];
    execArgv: string[];
    execPath: string;
    cwd(): string;
    chdir(directory: string): void;
    exit(code?: number): never;
    kill(pid: number, signal?: string): void;
    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): boolean;
    removeListener(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
    listeners(event: string): Function[];
    listenerCount(event: string): number;
    setMaxListeners(n: number): void;
    getMaxListeners(): number;
    defaultMaxListeners: number;
    domain: any;
    memoryUsage(): {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nextTick(callback: (...args: any[]) => void, ...args: any[]): void;
    umask(mask?: number): number;
    uptime(): number;
    hrtime(time?: [number, number]): [number, number];
    send(message: any, sendHandle?: any): void;
    disconnect(): void;
    connected: boolean;
    stderr: any;
    stdin: any;
    stdout: any;
  };
  export = process;
} 