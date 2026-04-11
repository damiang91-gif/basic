import React, { createContext, useContext, useEffect, useState } from 'react';
import { FiscalData } from '../types';
import {
  saveFiscalData as storageSave,
  loadFiscalData,
  saveApiKey as storageSaveKey,
  loadApiKey,
} from '../services/storageService';

interface UserDataContextValue {
  fiscalData: FiscalData | null;
  isLoaded: boolean;
  saveFiscalData: (data: FiscalData) => Promise<void>;
  gcvApiKey: string | null;
  saveGcvApiKey: (key: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [fiscalData, setFiscalData] = useState<FiscalData | null>(null);
  const [gcvApiKey, setGcvApiKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadFiscalData(), loadApiKey()]).then(([data, key]) => {
      setFiscalData(data);
      setGcvApiKey(key);
      setIsLoaded(true);
    });
  }, []);

  async function saveFiscalData(data: FiscalData) {
    await storageSave(data);
    setFiscalData(data);
  }

  async function saveGcvApiKey(key: string) {
    await storageSaveKey(key);
    setGcvApiKey(key);
  }

  return (
    <UserDataContext.Provider
      value={{ fiscalData, isLoaded, saveFiscalData, gcvApiKey, saveGcvApiKey }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData(): UserDataContextValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
