'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSidebar } from '@/components/settings/settings-sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { settingsTabs } from '@/components/settings/settings-sidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = settingsTabs.find((tab) => tab.href === pathname) || settingsTabs[0];

  const pageTitle = currentTab.name;
  const pageDescription = currentTab.description;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 @md:gap-6 overflow-hidden p-4 @md:p-6">
        <SettingsHeader title={pageTitle} description={pageDescription} />

        <div className="flex flex-1 flex-col gap-4 @md:gap-6 overflow-auto xl:flex-row xl:overflow-hidden">
          {/* Mobile/Tablet dropdown */}
          <div className="xl:hidden">
            <Select
              value={currentTab.href}
              onValueChange={(value) => {
                router.push(value);
              }}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <currentTab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{currentTab.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {settingsTabs.map((tab) => (
                  <SelectItem key={tab.href} value={tab.href}>
                    <div className="flex items-center gap-3">
                      <tab.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{tab.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Sidebar */}
          <SettingsSidebar />

          {/* Main Content */}
          <main className="flex w-full overflow-y-auto xl:overflow-y-hidden">
            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex-1 scroll-smooth xl:pb-16">
                <div className="w-full max-w-none space-y-4 @md:space-y-6">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
