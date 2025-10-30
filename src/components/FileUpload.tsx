import { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { AccessPolicy } from '@/types';
import { awsService } from '@/services/aws-service';
import { demoService } from '@/services/demo-service';
import { useApp } from '@/contexts/AppContext';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const { user, isDemoMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [policy, setPolicy] = useState<AccessPolicy>({
    allowedCountries: ['India'],
    allowedTimeStart: '09:00',
    allowedTimeEnd: '18:00',
    trustedDevices: [],
    requireStepUp: false,
  });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      const service = isDemoMode ? demoService : awsService;
      await service.uploadFile(file, policy, user.id);
      
      toast.success('File uploaded successfully!');
      setIsOpen(false);
      setFile(null);
      onUploadComplete();
    } catch (error) {
      toast.error(isDemoMode ? 'Upload failed in demo mode' : 'Upload failed. Please check AWS configuration.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload File with Access Policy</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Policy</CardTitle>
              <CardDescription>Define who can access this file and when</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed Countries (comma-separated)</Label>
                <Input
                  placeholder="India, United States"
                  value={policy.allowedCountries.join(', ')}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      allowedCountries: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allowed Time Start (24h)</Label>
                  <Input
                    type="time"
                    value={policy.allowedTimeStart || ''}
                    onChange={(e) =>
                      setPolicy({ ...policy, allowedTimeStart: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Time End (24h)</Label>
                  <Input
                    type="time"
                    value={policy.allowedTimeEnd || ''}
                    onChange={(e) =>
                      setPolicy({ ...policy, allowedTimeEnd: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stepup"
                  checked={policy.requireStepUp}
                  onCheckedChange={(checked) =>
                    setPolicy({ ...policy, requireStepUp: checked as boolean })
                  }
                />
                <Label htmlFor="stepup" className="cursor-pointer">
                  Require step-up authentication (OTP)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
