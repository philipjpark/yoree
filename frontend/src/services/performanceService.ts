import React from 'react';

export interface PerformanceMetrics {
  timestamp: number;
  component: string;
  action: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  apiResponseTime: number;
  transactionSpeed: number;
}

export interface UserMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  errors: number;
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private sessionStart: number = Date.now();
  private pageViews: number = 0;
  private interactions: number = 0;
  private errors: number = 0;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.recordMetric('page', 'load', performance.now(), true);
      });

      // Monitor API calls
      this.interceptFetch();
      
      // Monitor errors
      window.addEventListener('error', (event) => {
        this.recordMetric('error', 'unhandled', 0, false, event.error?.message);
        this.errors++;
      });

      // Monitor unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.recordMetric('error', 'promise_rejection', 0, false, event.reason);
        this.errors++;
      });
    }
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric('api', 'fetch', duration, response.ok, undefined, {
          url,
          status: response.status,
          method: args[1]?.method || 'GET'
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.recordMetric('api', 'fetch', duration, false, errorMessage, {
          url,
          method: args[1]?.method || 'GET'
        });
        throw error;
      }
    };
  }

  recordMetric(
    component: string,
    action: string,
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      component,
      action,
      duration,
      success,
      error,
      metadata
    };

    this.metrics.push(metric);
    
    // Notify observers
    this.observers.forEach(observer => observer(metric));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', metric);
    }
  }

  startTimer(component: string, action: string) {
    const startTime = performance.now();
    return {
      end: (success: boolean = true, error?: string, metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        this.recordMetric(component, action, duration, success, error, metadata);
      }
    };
  }

  recordPageView(page: string) {
    this.pageViews++;
    this.recordMetric('navigation', 'page_view', 0, true, undefined, { page });
  }

  recordInteraction(component: string, action: string) {
    this.interactions++;
    this.recordMetric('interaction', action, 0, true, undefined, { component });
  }

  recordError(component: string, action: string, error: string) {
    this.errors++;
    this.recordMetric('error', action, 0, false, error, { component });
  }

  getSystemMetrics(): SystemMetrics {
    if (typeof window === 'undefined') {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
        apiResponseTime: 0,
        transactionSpeed: 0
      };
    }

    // Memory usage (if available)
    const memoryUsage = (performance as any).memory 
      ? (performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit * 100
      : 0;

    // API response time (average of recent API calls)
    const apiMetrics = this.metrics.filter(m => m.component === 'api' && m.success);
    const apiResponseTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      : 0;

    // Network latency (simplified)
    const networkLatency = apiResponseTime * 0.3; // Estimate

    // Transaction speed (mock for now)
    const transactionSpeed = 400; // ms

    return {
      memoryUsage,
      cpuUsage: 0, // Would need more sophisticated monitoring
      networkLatency,
      apiResponseTime,
      transactionSpeed
    };
  }

  getUserMetrics(): UserMetrics {
    const sessionDuration = Date.now() - this.sessionStart;
    
    return {
      sessionDuration,
      pageViews: this.pageViews,
      interactions: this.interactions,
      errors: this.errors
    };
  }

  getPerformanceReport() {
    const systemMetrics = this.getSystemMetrics();
    const userMetrics = this.getUserMetrics();
    
    // Calculate success rates
    const totalMetrics = this.metrics.length;
    const successfulMetrics = this.metrics.filter(m => m.success).length;
    const successRate = totalMetrics > 0 ? (successfulMetrics / totalMetrics) * 100 : 100;

    // Calculate average response times by component
    const componentAverages = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.component]) {
        acc[metric.component] = { total: 0, count: 0 };
      }
      acc[metric.component].total += metric.duration;
      acc[metric.component].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const componentMetrics = Object.entries(componentAverages).map(([component, data]) => ({
      component,
      averageResponseTime: data.count > 0 ? data.total / data.count : 0,
      totalCalls: data.count
    }));

    return {
      timestamp: Date.now(),
      systemMetrics,
      userMetrics,
      successRate,
      componentMetrics,
      totalMetrics,
      recentMetrics: this.metrics.slice(-10) // Last 10 metrics
    };
  }

  subscribe(observer: (metrics: PerformanceMetrics) => void) {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  clearMetrics() {
    this.metrics = [];
  }

  exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    } else {
      // CSV format
      const headers = ['timestamp', 'component', 'action', 'duration', 'success', 'error'];
      const rows = this.metrics.map(m => [
        m.timestamp,
        m.component,
        m.action,
        m.duration,
        m.success,
        m.error || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  // Performance monitoring decorators
  monitorComponent(componentName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function(...args: any[]) {
        const timer = performanceService.startTimer(componentName, propertyKey);
        
        try {
          const result = await originalMethod.apply(this, args);
          timer.end(true);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          timer.end(false, errorMessage);
          throw error;
        }
      };
      
      return descriptor;
    };
  }

  monitorAsync(componentName: string, actionName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function(...args: any[]) {
        const timer = performanceService.startTimer(componentName, actionName);
        
        try {
          const result = await originalMethod.apply(this, args);
          timer.end(true);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          timer.end(false, errorMessage);
          throw error;
        }
      };
      
      return descriptor;
    };
  }
}

export const performanceService = new PerformanceService();

// React Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = React.useState<SystemMetrics>(performanceService.getSystemMetrics());
  const [userMetrics, setUserMetrics] = React.useState<UserMetrics>(performanceService.getUserMetrics());

  React.useEffect(() => {
    const unsubscribe = performanceService.subscribe((metric) => {
      setMetrics(prev => [...prev, metric]);
    });

    // Update metrics periodically
    const interval = setInterval(() => {
      setSystemMetrics(performanceService.getSystemMetrics());
      setUserMetrics(performanceService.getUserMetrics());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    metrics,
    systemMetrics,
    userMetrics,
    recordPageView: performanceService.recordPageView.bind(performanceService),
    recordInteraction: performanceService.recordInteraction.bind(performanceService),
    recordError: performanceService.recordError.bind(performanceService),
    startTimer: performanceService.startTimer.bind(performanceService),
    getPerformanceReport: performanceService.getPerformanceReport.bind(performanceService)
  };
};

export default performanceService; 