import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  use12Hour: boolean;
  setUse12Hour: (v: boolean) => void;
  showAmPm: boolean;
  setShowAmPm: (v: boolean) => void;
  secondFraction: 'none' | '2 digits';
  setSecondFraction: (v: 'none' | '2 digits') => void;
  useServerTime: boolean;
  setUseServerTime: (v: boolean) => void;
  clockOpacity: number;
  setClockOpacity: (v: number) => void;
  autoStartOnBoot: boolean;
  setAutoStartOnBoot: (v: boolean) => void;
  hideOnLandscape: boolean;
  setHideOnLandscape: (v: boolean) => void;
  theme: 'dark';
  hasOverlayPermission: boolean;
  setHasOverlayPermission: (v: boolean) => void;
  activeWidget: string | null;
  setActiveWidget: (v: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [use12Hour, setUse12Hour] = useState(true);
  const [showAmPm, setShowAmPm] = useState(true);
  const [secondFraction, setSecondFraction] = useState<'none' | '2 digits'>('2 digits');
  const [useServerTime, setUseServerTime] = useState(true);
  const [clockOpacity, setClockOpacity] = useState(0.25);
  const [autoStartOnBoot, setAutoStartOnBoot] = useState(false);
  const [hideOnLandscape, setHideOnLandscape] = useState(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  return (
    <SettingsContext.Provider value={{
      use12Hour, setUse12Hour,
      showAmPm, setShowAmPm,
      secondFraction, setSecondFraction,
      useServerTime, setUseServerTime,
      clockOpacity, setClockOpacity,
      autoStartOnBoot, setAutoStartOnBoot,
      hideOnLandscape, setHideOnLandscape,
      theme: 'dark',
      hasOverlayPermission, setHasOverlayPermission,
      activeWidget, setActiveWidget,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
