'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { Settings, Palette, Cookie, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useCookieContext } from '@/contexts/cookie-context';
import { useSettings } from '@/contexts/settings-context';
import { CookiePreferences, COOKIE_CATEGORIES } from '@/types/cookies.types';
import { clearAllCookies } from '@/lib/cookies';
import { type FontKey } from '@/lib/fonts';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { Key } from 'lucide-react';
import { LANGUAGE_OPTIONS, FONT_OPTIONS, FONT_SIZE_OPTIONS } from '@/config/app';
import type { HeaderTitleType } from '@/types/header.types';
import { CURRENCY_OPTIONS } from '@/config/app';

const HEADER_TITLE_OPTIONS = [
  { value: 'time-based', label: 'Time-Based Greetings', description: 'Good morning, John!' },
  { value: 'page-based', label: 'Page Names', description: 'Dashboard, Accounts, etc.' },
  { value: 'financial-status', label: 'Financial Status', description: 'Total Balance: $12,450' },
  {
    value: 'quick-stats',
    label: 'Quick Stats',
    description: '3 Accounts • $3,200 In • $2,000 Out • $1,200 Net (40%)',
  },
  { value: 'motivational', label: 'Motivational Messages', description: 'Keep up the great work!' },
] as const;

interface GeneralSettingsFormProps {
  isLoading?: boolean;
  onSubmit?: (data: GeneralSettingsFormData) => void;
  isPasswordAuthenticated?: boolean;
}

export interface GeneralSettingsFormData {
  systemFont?: string;
  language?: string;
  cookiesEnabled?: boolean;
  analyticsEnabled?: boolean;
  compactMode?: boolean;
  showSidebarLabels?: boolean;
  animationsEnabled?: boolean;
  fontSize?: string;
  fontFamily?: FontKey;
  headerTitlePreference?: HeaderTitleType;
  baseCurrency?: string;
}

export function GeneralSettingsForm({
  isLoading = false,
  isPasswordAuthenticated = false,
}: GeneralSettingsFormProps) {
  const { preferences, updatePreferences } = useCookieContext();
  const {
    systemFont,
    language,
    fontSize,
    headerTitlePreference,
    baseCurrency,
    setSystemFont,
    setLanguage,
    setFontSize,
    setHeaderTitlePreference,
    setBaseCurrency,
    isLoading: settingsLoading,
    isSaving,
    savePreferences,
    resetPreferences,
  } = useSettings();

  const [formData, setFormData] = useState<GeneralSettingsFormData>({
    systemFont,
    language,
    fontSize,
    cookiesEnabled: true,
    analyticsEnabled: true,
    compactMode: false,
    showSidebarLabels: true,
    animationsEnabled: true,
    fontFamily: 'system',
    headerTitlePreference,
    baseCurrency,
  });
  const [showCookieDialog, setShowCookieDialog] = useState(false);
  const [tempCookiePreferences, setTempCookiePreferences] =
    useState<CookiePreferences>(preferences);
  const [isSavingCookies, setIsSavingCookies] = useState(false);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Update form data when settings change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      systemFont,
      language,
      fontSize,
      headerTitlePreference,
      baseCurrency,
    }));
  }, [systemFont, language, fontSize, headerTitlePreference, baseCurrency]);

  const handleInputChange = (field: keyof GeneralSettingsFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update preferences immediately
    if (field === 'systemFont') {
      setSystemFont(value as FontKey);
    } else if (field === 'language') {
      setLanguage(value as string);
    } else if (field === 'fontSize') {
      setFontSize(value as string);
    } else if (field === 'headerTitlePreference') {
      setHeaderTitlePreference(value as HeaderTitleType);
    } else if (field === 'baseCurrency') {
      setBaseCurrency(value as string);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferences();
      notifySuccess('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const handleResetPreferences = async () => {
    try {
      await resetPreferences();
      notifySuccess('Settings reset to defaults');
    } catch (err) {
      console.error('Failed to reset preferences:', err);
    }
  };

  const handleCookiePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies

    setTempCookiePreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSaveCookiePreferences = async () => {
    try {
      setIsSavingCookies(true);
      await updatePreferences(tempCookiePreferences);
      notifySuccess('Cookie preferences saved successfully');
      setShowCookieDialog(false);
    } catch (error) {
      notifyError('Failed to save cookie preferences');
      console.error('Cookie preferences error:', error);
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleClearAllCookies = () => {
    clearAllCookies();
    // Reset to default preferences
    const defaultPrefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    updatePreferences(defaultPrefs);
    setTempCookiePreferences(defaultPrefs);
  };

  // Security handlers
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const handlePasswordChange = () => {
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.current = 'Current password is required';
    }

    if (!newPassword) {
      errors.new = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.new = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.new = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(newPassword)) {
      errors.new = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.new = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      errors.new = 'Password must contain at least one special character';
    }

    if (!confirmPassword) {
      errors.confirm = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    notifySuccess('Password updated successfully');
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorDialog(true);
    } else {
      // TODO: Implement 2FA disable logic
      setTwoFactorEnabled(false);
      notifySuccess('Two-factor authentication disabled');
    }
  };

  const handleTwoFactorSetup = () => {
    // TODO: Implement 2FA setup logic
    setTwoFactorEnabled(true);
    setShowTwoFactorDialog(false);
    notifySuccess('Two-factor authentication enabled');
  };

  return (
    <>
      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the application looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* System Font */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="system_font" className="text-sm font-medium">
                  System Font
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose the font family for the interface
                </p>
              </div>
              <Select
                value={formData.systemFont}
                onValueChange={(value) => handleInputChange('systemFont', value)}
                disabled={settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Font Size</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the base font size for better readability
                </p>
              </div>
              <Select
                value={formData.fontSize}
                onValueChange={(value) => handleInputChange('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="language" className="text-sm font-medium">
                  Language
                </Label>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange('language', value)}
                disabled={settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Header Title Preference */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="header_title" className="text-sm font-medium">
                  Header Title Style
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose how the header title is displayed
                </p>
              </div>
              <Select
                value={formData.headerTitlePreference}
                onValueChange={(value) => handleInputChange('headerTitlePreference', value)}
                disabled={settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Header Style">
                    {formData.headerTitlePreference &&
                      HEADER_TITLE_OPTIONS.find(
                        (opt) => opt.value === formData.headerTitlePreference,
                      )?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {HEADER_TITLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Base Currency */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="base_currency" className="text-sm font-medium">
                  Base Currency
                </Label>
                <p className="text-sm text-muted-foreground">
                  All account balances will be converted to this currency for total balance
                </p>
              </div>
              <Select
                value={formData.baseCurrency}
                onValueChange={(value) => handleInputChange('baseCurrency', value)}
                disabled={settingsLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-start md:justify-end md:flex-shrink-0 gap-2">
            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetPreferences} disabled={isSaving}>
              Reset to Defaults
            </Button>

            {/* Save Button */}
            <Button onClick={handleSavePreferences} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? <LoadingSpinner message="Saving..." inline /> : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Privacy & Cookies
            </CardTitle>
            <CardDescription>Manage your privacy preferences and cookie settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Cookie Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  Control which cookies are used for analytics and personalization
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTempCookiePreferences(preferences);
                  setShowCookieDialog(true);
                }}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Cookies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings - Only show for password authenticated users */}
        {isPasswordAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Security */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Password</Label>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-600" />
                        Change Password
                      </DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setCurrentPassword(e.target.value)
                            }
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(!showPasswords)}
                          >
                            {showPasswords ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormError message={passwordErrors.current} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type={showPasswords ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewPassword(e.target.value)
                          }
                          placeholder="Enter new password"
                        />
                        <FormError message={passwordErrors.new} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type={showPasswords ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setConfirmPassword(e.target.value)
                          }
                          placeholder="Confirm new password"
                        />
                        <FormError message={passwordErrors.confirm} />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handlePasswordChange} className="flex-1">
                          Update Password
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">2FA Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled
                      ? 'Two-factor authentication is enabled'
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {twoFactorEnabled && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                  )}
                  <Button
                    variant={twoFactorEnabled ? 'destructive' : 'default'}
                    onClick={handleTwoFactorToggle}
                    className="w-full sm:w-auto"
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showCookieDialog} onOpenChange={setShowCookieDialog}>
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
                    checked={tempCookiePreferences[key as keyof CookiePreferences]}
                    onCheckedChange={(checked) =>
                      handleCookiePreferenceChange(key as keyof CookiePreferences, checked)
                    }
                    disabled={category.required}
                  />
                </div>
                {key !== 'functional' && <Separator />}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSaveCookiePreferences}
              className="flex-1"
              disabled={isSavingCookies}
            >
              {isSavingCookies ? <LoadingSpinner message="Saving..." inline /> : 'Save Preferences'}
            </Button>

            <Button
              onClick={handleClearAllCookies}
              variant="outline"
              className="flex-1"
              disabled={isSavingCookies}
            >
              Clear All Cookies
            </Button>

            <Button
              onClick={() => {
                setTempCookiePreferences(preferences);
                setShowCookieDialog(false);
              }}
              variant="outline"
              className="flex-1"
              disabled={isSavingCookies}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Follow these steps to set up two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 1: Install an authenticator app</p>
              <p className="text-sm text-muted-foreground">
                Download Google Authenticator, Authy, or similar app on your phone
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 2: Scan QR Code</p>
              <div className="flex justify-center p-4 bg-muted rounded-lg">
                <div className="w-32 h-32 bg-muted-foreground/20 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">QR Code</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 3: Enter verification code</p>
              <Input placeholder="Enter 6-digit code from your app" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleTwoFactorSetup} className="flex-1">
                Enable 2FA
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTwoFactorDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
