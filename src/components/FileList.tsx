import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Clock, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { FileItem, ValidationResult } from '@/types';
import { awsService } from '@/services/aws-service';
import { demoService } from '@/services/demo-service';
import { contextService } from '@/services/context-service';
import { useApp } from '@/contexts/AppContext';

interface FileListProps {
  refreshTrigger: number;
}

export const FileList = ({ refreshTrigger }: FileListProps) => {
  const { user, currentContext, isDemoMode } = useApp();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger, isDemoMode]);

  const loadFiles = async () => {
    if (!user) return;

    try {
      const service = isDemoMode ? demoService : awsService;
      const fetchedFiles = await service.getFiles(user.id);
      setFiles(fetchedFiles);
    } catch (error) {
      toast.error('Failed to load files');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    setSelectedFile(file);
    
    if (currentContext) {
      const result = contextService.validateAccess(currentContext, file.policy);
      setValidationResult(result);
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (!currentContext) {
      toast.error('Context not available');
      return;
    }

    const validation = contextService.validateAccess(currentContext, file.policy);

    if (!validation.allowed) {
      toast.error('Access Denied', {
        description: validation.reason,
      });
      return;
    }

    if (validation.requireStepUp) {
      toast.info('Step-up authentication required', {
        description: 'In production, an OTP would be sent to your email/phone.',
      });
      // In production, trigger OTP flow here
      return;
    }

    try {
      const service = isDemoMode ? demoService : awsService;
      const url = await service.getDownloadUrl(file);
      
      // In demo mode, simulate download
      if (isDemoMode) {
        toast.success('Download started (demo mode)');
      } else {
        window.open(url, '_blank');
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Download failed');
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No files uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <Card
            key={file.id}
            className="hover:shadow-card transition-all cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(file.uploadedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {file.policy.allowedCountries.join(', ') || 'Any'}
                </div>
                <div>{formatFileSize(file.size)}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileClick(file);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedFile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-2">File Details</h4>
                <div className="space-y-2 text-sm">
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  <p>Uploaded: {formatDate(selectedFile.uploadedAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Access Policy</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Countries: {selectedFile.policy.allowedCountries.join(', ') || 'Any'}</span>
                  </div>
                  {selectedFile.policy.allowedTimeStart && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Time: {selectedFile.policy.allowedTimeStart} - {selectedFile.policy.allowedTimeEnd}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Step-up: {selectedFile.policy.requireStepUp ? 'Required' : 'Not required'}</span>
                  </div>
                </div>
              </div>

              {validationResult && (
                <div>
                  <h4 className="font-medium mb-2">Access Validation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={validationResult.allowed ? 'default' : 'destructive'}>
                        {validationResult.allowed
                          ? validationResult.requireStepUp
                            ? 'Allowed (Step-up required)'
                            : 'Allowed'
                          : 'Denied'}
                      </Badge>
                      {validationResult.riskScore !== undefined && (
                        <Badge variant="outline" className="font-mono">
                          Risk Score: {validationResult.riskScore}/100
                        </Badge>
                      )}
                    </div>
                    {validationResult.reason && (
                      <p className="text-sm text-muted-foreground">{validationResult.reason}</p>
                    )}
                    {validationResult.violations.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-destructive">
                        {validationResult.violations.map((v, i) => (
                          <li key={i}>• {v}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => handleDownload(selectedFile)}
                disabled={validationResult ? !validationResult.allowed : false}
              >
                Download File
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
