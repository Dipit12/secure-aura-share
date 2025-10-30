import { Shield, LogOut, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApp } from '@/contexts/AppContext';

export const Header = () => {
  const { user, currentContext, isDemoMode, logout } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-primary bg-clip-text text-transparent">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SecureShare</h1>
          </div>
          {isDemoMode && (
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3 w-3" />
              Demo Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentContext && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex flex-col items-end text-sm">
                    <span className="text-muted-foreground">
                      {currentContext.country} • {currentContext.deviceId.slice(0, 8)}...
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>Device: {currentContext.deviceId}</p>
                    <p>Location: {currentContext.country}</p>
                    <p>IP: {currentContext.ipAddress}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {user && (
            <>
              <span className="text-sm font-medium">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
