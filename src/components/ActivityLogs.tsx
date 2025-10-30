import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AccessLog } from '@/types';
import { awsService } from '@/services/aws-service';
import { demoService } from '@/services/demo-service';
import { useApp } from '@/contexts/AppContext';

export const ActivityLogs = () => {
  const { user, isDemoMode } = useApp();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [isDemoMode]);

  const loadLogs = async () => {
    if (!user) return;

    try {
      const service = isDemoMode ? demoService : awsService;
      const fetchedLogs = await service.getAccessLogs(user.id);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'allowed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'step-up-required':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'allowed':
        return <Badge variant="default" className="bg-success">Allowed</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'step-up-required':
        return <Badge variant="default" className="bg-warning">Step-up Required</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading activity logs...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex-shrink-0 mt-1">{getResultIcon(log.result)}</div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{log.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.action.toUpperCase()} • {formatDate(log.timestamp)}
                      </p>
                    </div>
                    {getResultBadge(log.result)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Device: {log.context.deviceId.slice(0, 12)}...</div>
                    <div>Country: {log.context.country}</div>
                    <div>IP: {log.context.ipAddress}</div>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-destructive">{log.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
