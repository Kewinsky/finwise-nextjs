'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCookieContext } from '@/contexts/cookie-context';
import { CookiePreferences, COOKIE_CATEGORIES } from '@/types/cookies.types';
import { Settings, Check, X as RejectIcon, Cookie } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';

export function CookieBanner() {
  const router = useRouter();
  const { showBanner, acceptAll, rejectAll, acceptSelected, hideBanner, preferences } =
    useCookieContext();

  const [showDetails, setShowDetails] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);

  if (!showBanner) return null;

  const handleAcceptSelected = async () => {
    try {
      setIsSaving(true);
      await acceptSelected(tempPreferences);
      notifySuccess('Cookie preferences saved successfully');
      setShowDetails(false);
    } catch (error) {
      notifyError('Failed to save cookie preferences');
      console.error('Cookie preferences error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies

    setTempPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <Card className="mx-auto max-w-4xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">🍪 We use cookies</CardTitle>
            <CardDescription>
              We use cookies to enhance your browsing experience, serve personalized content, and
              analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of
              cookies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={acceptAll} className="flex-1" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Accept All
              </Button>

              <Button onClick={rejectAll} variant="outline" className="flex-1" size="sm">
                <RejectIcon className="w-4 h-4 mr-2" />
                Reject All
              </Button>

              <Button onClick={() => setShowDetails(true)} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              You can change your cookie preferences at any time in your{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-xs underline"
                onClick={() => {
                  hideBanner();
                  router.push('/settings');
                }}
              >
                account settings
              </Button>
              .
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-orange-600" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {category.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={tempPreferences[key as keyof CookiePreferences]}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange(key as keyof CookiePreferences, checked)
                    }
                    disabled={category.required}
                  />
                </div>
                {key !== 'functional' && <Separator />}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleAcceptSelected} className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <LoadingSpinner message="Saving..." inline />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
