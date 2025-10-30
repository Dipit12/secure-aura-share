import { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { contextService } from '@/services/context-service';
import { demoService } from '@/services/demo-service';
import type { AccessContext, FileItem } from '@/types';

export const DemoSection = () => {
  const [scenario, setScenario] = useState<'normal' | 'suspicious' | 'foreign' | 'new-device'>('normal');
  const [selectedFileId, setSelectedFileId] = useState<string>('1');
  const [result, setResult] = useState<{
    context: AccessContext;
    validation: any;
  } | null>(null);

  const demoFiles = demoService.getDemoFiles();

  const runDemo = () => {
    const context = contextService.getDemoContext(scenario);
    const file = demoFiles.find(f => f.id === selectedFileId);
    
    if (!file) return;

    const validation = contextService.validateAccess(context, file.policy);
    
    setResult({ context, validation });

    if (validation.allowed) {
      if (validation.requireStepUp) {
        toast.info('Access requires step-up authentication', {
          description: 'OTP would be sent to your email/phone.',
        });
      } else {
        toast.success('Access granted!', {
          description: 'File download would proceed.',
        });
      }
    } else {
      toast.error('Access denied', {
        description: validation.reason,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Demo & Testing
        </CardTitle>
        <CardDescription>
          Test context-aware access control with different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select File</label>
          <Select value={selectedFileId} onValueChange={setSelectedFileId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demoFiles.map(file => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Scenario</label>
          <Select value={scenario} onValueChange={(v: any) => setScenario(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal Access (India, 10 AM, Trusted Device)</SelectItem>
              <SelectItem value="suspicious">Suspicious Time (India, 3 AM, Trusted Device)</SelectItem>
              <SelectItem value="foreign">Foreign Country (Russia, 10 AM, Trusted Device)</SelectItem>
              <SelectItem value="new-device">New Device (India, 10 AM, Unknown Device)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={runDemo} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Run Test
        </Button>

        {result && (
          <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Context
                <Badge variant="secondary" className="text-xs">
                  {result.context.country}
                </Badge>
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Device: {result.context.deviceId}</p>
                <p>IP: {result.context.ipAddress}</p>
                <p>Time: {new Date(result.context.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Result</h4>
              <Badge
                variant={result.validation.allowed ? 'default' : 'destructive'}
                className={result.validation.allowed ? 'bg-success' : ''}
              >
                {result.validation.allowed
                  ? result.validation.requireStepUp
                    ? 'Allowed (Step-up Required)'
                    : 'Allowed'
                  : 'Denied'}
              </Badge>
              {result.validation.violations.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-destructive">
                  {result.validation.violations.map((v: string, i: number) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            This demo simulates the context validation logic. In production, actual IP geolocation, time validation, and device fingerprinting would be applied.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
