
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Lead, StageId, ChatMessage, Service, Info, AccountConfig } from './types';

const SETTINGS_KEY = 'leadflow_settings_v2';
const LEGACY_SETTINGS_KEY = 'leadflow_settings';

interface LeadsContextType {
  leads: Lead[];
  services: Service[];
  info: Info[];
  accounts: AccountConfig[];
  activeAccount: AccountConfig | null;
  isSyncing: boolean;
  isSyncingServices: boolean;
  isSyncingInfo: boolean;
  isLoaded: boolean;
  webhookUrl: string;
  leadEditUrl: string;
  historyWebhookUrl: string;
  botWebhookUrl: string;
  instanceName: string;
  servicesUrl: string;
  servicesEditUrl: string;
  servicesCreateUrl: string;
  servicesDeleteUrl: string;
  infoUrl: string;
  infoEditUrl: string;
  infoCreateUrl: string;
  infoDeleteUrl: string;
  syncLeads: () => Promise<void>;
  syncServices: () => Promise<void>;
  syncInfo: () => Promise<void>;
  getHistory: (leadIdentifier: string) => Promise<ChatMessage[]>;
  toggleBot: (whatsapp: string, status: boolean) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (id: string, stageId: StageId) => void;
  createService: (serviceData: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  createInfo: (infoData: Omit<Info, 'id'>) => Promise<void>;
  updateInfo: (id: string, infoData: Partial<Info>) => Promise<void>;
  deleteInfo: (id: string) => Promise<void>;
  updateSettings: (accounts: AccountConfig[], activeAccountId: string) => void;
  setActiveAccountId: (id: string) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountConfig[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [info, setInfo] = useState<Info[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingServices, setIsSyncingServices] = useState(false);
  const [isSyncingInfo, setIsSyncingInfo] = useState(false);
  
  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;
  const initialSyncDone = useRef<string | null>(null);

  const processIncomingData = useCallback((payload: any[]) => {
    if (!Array.isArray(payload)) return;
    
    const stageMapping: Record<string, StageId> = {
      'nuevo': 'new', 'new': 'new',
      'contactado': 'contacted', 'contacted': 'contacted',
      'cualificado': 'qualified', 'qualified': 'qualified',
      'convertido': 'converted', 'converted': 'converted'
    };

    const newLeadsFromWebhook = payload.map(incoming => {
      const rawStage = (incoming.ESTADO_KANBAN || 'new').toString().toLowerCase().trim();
      const mappedStage = stageMapping[rawStage] || 'new';

      return {
        id: incoming.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: incoming.PUSHNAME || "Nuevo Prospecto WhatsApp",
        contactName: incoming.PUSHNAME || "Sin Nombre",
        email: incoming.EMAIL || "",
        phone: incoming.WHATSAPP?.toString() || incoming.REMOTEJID?.split('@')[0] || "",
        remoteJid: incoming.REMOTEJID || `${incoming.WHATSAPP}@s.whatsapp.net`,
        company: incoming.INSTANCE || activeAccount?.instanceName || "S/I",
        stage: mappedStage,
        notes: incoming.MESSAGE || incoming.notes || "Sin mensaje",
        budget: incoming.PRESUPUESTO || incoming.budget || 0,
        createdAt: incoming.createdAt || new Date().toISOString(),
        updatedAt: incoming.updatedAt || new Date().toISOString(),
        botActive: String(incoming.ESTADO_BOT) === '1',
      };
    });

    setLeads(newLeadsFromWebhook);
  }, [activeAccount]);

  const syncServices = useCallback(async () => {
    if (!activeAccount?.servicesUrl) return;
    setIsSyncingServices(true);
    try {
      const response = await fetch(activeAccount.servicesUrl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error sincronizando servicios:', err);
    } finally {
      setIsSyncingServices(false);
    }
  }, [activeAccount]);

  const syncInfo = useCallback(async () => {
    if (!activeAccount?.infoUrl) return;
    setIsSyncingInfo(true);
    try {
      const response = await fetch(activeAccount.infoUrl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setInfo(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error sincronizando información:', err);
    } finally {
      setIsSyncingInfo(false);
    }
  }, [activeAccount]);

  const syncLeads = useCallback(async () => {
    if (!activeAccount?.webhookUrl) return;
    setIsSyncing(true);
    try {
      const response = await fetch(activeAccount.webhookUrl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
      }
    } catch (err) {
      console.error('Error sincronizando leads:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [activeAccount, processIncomingData]);

  useEffect(() => {
    const savedV2 = localStorage.getItem(SETTINGS_KEY);
    const savedLegacy = localStorage.getItem(LEGACY_SETTINGS_KEY);

    if (savedV2) {
      try {
        const settings = JSON.parse(savedV2);
        setAccounts(settings.accounts || []);
        setActiveAccountId(settings.activeAccountId || '');
      } catch (e) { console.error("Error loading V2 settings"); }
    } else if (savedLegacy) {
      try {
        const legacy = JSON.parse(savedLegacy);
        const initialAccount: AccountConfig = {
          id: 'default',
          name: legacy.instanceName || 'Cuenta Principal',
          webhookUrl: legacy.webhookUrl || '',
          leadEditUrl: legacy.leadEditUrl || '',
          historyWebhookUrl: legacy.historyWebhookUrl || '',
          botWebhookUrl: legacy.botWebhookUrl || '',
          instanceName: legacy.instanceName || 'HALCONDIGITAL',
          servicesUrl: legacy.servicesUrl || '',
          servicesCreateUrl: legacy.servicesCreateUrl || '',
          servicesEditUrl: legacy.servicesEditUrl || '',
          servicesDeleteUrl: legacy.servicesDeleteUrl || '',
          infoUrl: legacy.infoUrl || '',
          infoCreateUrl: legacy.infoCreateUrl || '',
          infoEditUrl: legacy.infoEditUrl || '',
          infoDeleteUrl: legacy.infoDeleteUrl || ''
        };
        setAccounts([initialAccount]);
        setActiveAccountId('default');
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ accounts: [initialAccount], activeAccountId: 'default' }));
      } catch (e) { console.error("Error migrating legacy settings"); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (activeAccountId && initialSyncDone.current !== activeAccountId) {
      syncLeads();
      syncServices();
      syncInfo();
      initialSyncDone.current = activeAccountId;
    }
  }, [activeAccountId, syncLeads, syncServices, syncInfo]);

  const updateSettings = (newAccounts: AccountConfig[], newActiveId: string) => {
    setAccounts(newAccounts);
    setActiveAccountId(newActiveId);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ accounts: newAccounts, activeAccountId: newActiveId }));
    initialSyncDone.current = null;
  };

  const pushLeadUpdate = useCallback(async (lead: Lead) => {
    if (!activeAccount?.leadEditUrl) return;
    try {
      const payload = {
        id: lead.id,
        PUSHNAME: lead.contactName,
        WHATSAPP: lead.phone,
        REMOTEJID: lead.remoteJid,
        INSTANCE: lead.company,
        ESTADO_KANBAN: lead.stage,
        MESSAGE: lead.notes,
        PRESUPUESTO: lead.budget,
        EMAIL: lead.email,
        ESTADO_BOT: lead.botActive ? '1' : '0'
      };
      await fetch(activeAccount.leadEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error('Error updating lead:', err); }
  }, [activeAccount]);

  const updateLead = (id: string, data: Partial<Lead>) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l);
      const leadToPush = updated.find(l => l.id === id);
      if (leadToPush) pushLeadUpdate(leadToPush);
      return updated;
    });
  };

  const moveLead = (id: string, stageId: StageId) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, stage: stageId, updatedAt: new Date().toISOString() } : l);
      const leadToPush = updated.find(l => l.id === id);
      if (leadToPush) pushLeadUpdate(leadToPush);
      return updated;
    });
  };

  const deleteLead = (id: string) => setLeads(prev => prev.filter(l => l.id !== id));

  const toggleBot = async (whatsapp: string, status: boolean) => {
    if (!activeAccount?.botWebhookUrl) return;
    setLeads(prev => {
      const updated = prev.map(l => {
        if (l.phone === whatsapp) {
          const newLead = { ...l, botActive: status };
          pushLeadUpdate(newLead);
          return newLead;
        }
        return l;
      });
      return updated;
    });
    try {
      await fetch(activeAccount.botWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, ESTADO_BOT: status ? '1' : '0' })
      });
    } catch (err) { console.error('Error toggling bot:', err); }
  };

  const createService = async (data: any) => {
    if (!activeAccount?.servicesCreateUrl) return;
    const res = await fetch(activeAccount.servicesCreateUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    if (res.ok) syncServices();
  };

  const updateService = async (id: string, data: any) => {
    if (!activeAccount?.servicesEditUrl) return;
    const res = await fetch(activeAccount.servicesEditUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, ...data}) });
    if (res.ok) syncServices();
  };

  const deleteService = async (id: string) => {
    if (!activeAccount?.servicesDeleteUrl) return;
    const res = await fetch(activeAccount.servicesDeleteUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) });
    if (res.ok) syncServices();
  };

  const createInfo = async (data: any) => {
    if (!activeAccount?.infoCreateUrl) return;
    const res = await fetch(activeAccount.infoCreateUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    if (res.ok) syncInfo();
  };

  const updateInfo = async (id: string, data: any) => {
    if (!activeAccount?.infoEditUrl) return;
    const res = await fetch(activeAccount.infoEditUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, ...data}) });
    if (res.ok) syncInfo();
  };

  const deleteInfo = async (id: string) => {
    if (!activeAccount?.infoDeleteUrl) return;
    const res = await fetch(activeAccount.infoDeleteUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) });
    if (res.ok) syncInfo();
  };

  const getHistory = async (id: string) => {
    if (!activeAccount?.historyWebhookUrl) return [];
    try {
      const url = new URL(activeAccount.historyWebhookUrl);
      url.searchParams.append('ID_LEAD', id);
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        return (Array.isArray(data) ? data : []).map((msg: any) => ({
          id: msg.id?.toString() || Math.random().toString(36).substr(2, 9),
          message: msg.MENSAJE || "",
          fromMe: String(msg.DE_MI) === "1",
          timestamp: msg.createdAt || new Date().toISOString(),
          type: msg.TIPO_MENSAJE || "conversation"
        }));
      }
    } catch (e) { console.error(e); }
    return [];
  };

  const value = {
    leads, services, info, accounts, activeAccount, isSyncing, isSyncingServices, isSyncingInfo, isLoaded,
    webhookUrl: activeAccount?.webhookUrl || '',
    leadEditUrl: activeAccount?.leadEditUrl || '',
    historyWebhookUrl: activeAccount?.historyWebhookUrl || '',
    botWebhookUrl: activeAccount?.botWebhookUrl || '',
    instanceName: activeAccount?.instanceName || '',
    servicesUrl: activeAccount?.servicesUrl || '',
    servicesEditUrl: activeAccount?.servicesEditUrl || '',
    servicesCreateUrl: activeAccount?.servicesCreateUrl || '',
    servicesDeleteUrl: activeAccount?.servicesDeleteUrl || '',
    infoUrl: activeAccount?.infoUrl || '',
    infoEditUrl: activeAccount?.infoEditUrl || '',
    infoCreateUrl: activeAccount?.infoCreateUrl || '',
    infoDeleteUrl: activeAccount?.infoDeleteUrl || '',
    syncLeads, syncServices, syncInfo, getHistory, toggleBot, updateLead, deleteLead, moveLead,
    createService, updateService, deleteService, createInfo, updateInfo, deleteInfo,
    updateSettings, setActiveAccountId
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadsProvider');
  return context;
}
