import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Activity, TestTube2, Info } from 'lucide-react';
import { Header } from '@/components/Header';
import { LoginForm } from '@/components/LoginForm';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { ActivityLogs } from '@/components/ActivityLogs';
import { DemoSection } from '@/components/DemoSection';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const { user, isDemoMode } = useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Context-Aware File Sharing
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced access control based on location, time, device, and behavior patterns
          </p>
          {isDemoMode && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>AWS credentials not configured. Running in demo mode with sample data.</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] lg:mx-auto">
            <TabsTrigger value="files" className="gap-2">
              <FileText className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Activity className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="demo" className="gap-2">
              <TestTube2 className="h-4 w-4" />
              Demo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Your Files</h2>
                <p className="text-sm text-muted-foreground">
                  Upload and manage files with custom access policies
                </p>
              </div>
              <FileUpload onUploadComplete={() => setRefreshTrigger(prev => prev + 1)} />
            </div>
            
            <FileList refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Activity Logs</h2>
              <p className="text-sm text-muted-foreground">
                Monitor all access attempts and their validation results
              </p>
            </div>
            
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Demo & Testing</h2>
              <p className="text-sm text-muted-foreground">
                Test the context-aware access control system with various scenarios
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DemoSection />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">1. Context Collection</h4>
                    <p className="text-muted-foreground">
                      Device fingerprint, IP address, geolocation, and timestamp are captured for every access attempt.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">2. Policy Validation</h4>
                    <p className="text-muted-foreground">
                      The system validates the context against the file's access policy (allowed countries, time windows, trusted devices).
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">3. Access Decision</h4>
                    <p className="text-muted-foreground">
                      Based on validation results: <strong>Allow</strong> access, <strong>Deny</strong> access, or require <strong>Step-up</strong> authentication (OTP).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">4. Audit Logging</h4>
                    <p className="text-muted-foreground">
                      All attempts are logged to DynamoDB for security monitoring and compliance.
                    </p>
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">AWS Services Used</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">S3</Badge>
                      <Badge variant="secondary">DynamoDB</Badge>
                      <Badge variant="secondary">Cognito</Badge>
                      <Badge variant="secondary">SES/SNS</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
