
"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Lead, StageId, ChatMessage, Service, Info } from './types';

const SETTINGS_KEY = 'leadflow_settings';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [info, setInfo] = useState<Info[]>([]);
  
  // Settings
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [historyWebhookUrl, setHistoryWebhookUrl] = useState<string>('');
  const [botWebhookUrl, setBotWebhookUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('HALCONDIGITAL');
  
  // Services Webhooks
  const [servicesUrl, setServicesUrl] = useState<string>('');
  const [servicesEditUrl, setServicesEditUrl] = useState<string>('');
  const [servicesCreateUrl, setServicesCreateUrl] = useState<string>('');
  const [servicesDeleteUrl, setServicesDeleteUrl] = useState<string>('');

  // Info Webhooks
  const [infoUrl, setInfoUrl] = useState<string>('');
  const [infoEditUrl, setInfoEditUrl] = useState<string>('');
  const [infoCreateUrl, setInfoCreateUrl] = useState<string>('');
  const [infoDeleteUrl, setInfoDeleteUrl] = useState<string>('');

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingServices, setIsSyncingServices] = useState(false);
  const [isSyncingInfo, setIsSyncingInfo] = useState(false);
  
  const initialSyncDone = useRef(false);

  const processIncomingData = useCallback((payload: any[]) => {
    if (!Array.isArray(payload)) return;
    
    const newLeadsFromWebhook = payload.map(incoming => ({
      id: incoming.id?.toString() || Math.random().toString(36).substr(2, 9),
      name: incoming.PUSHNAME || "Nuevo Prospecto WhatsApp",
      contactName: incoming.PUSHNAME || "Sin Nombre",
      email: "",
      phone: incoming.WHATSAPP?.toString() || incoming.REMOTEJID?.split('@')[0] || "",
      remoteJid: incoming.REMOTEJID || `${incoming.WHATSAPP}@s.whatsapp.net`,
      company: incoming.INSTANCE || instanceName,
      stage: 'new' as StageId,
      notes: incoming.MESSAGE || "Sin mensaje",
      createdAt: incoming.createdAt || new Date().toISOString(),
      updatedAt: incoming.updatedAt || new Date().toISOString(),
      botActive: incoming.ESTADO_BOT === '1',
    }));

    setLeads(newLeadsFromWebhook);
  }, [instanceName]);

  const syncServices = useCallback(async (url: string) => {
    if (!url) return;
    setIsSyncingServices(true);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error sincronizando servicios:', err);
    } finally {
      setIsSyncingServices(false);
    }
  }, []);

  const syncInfo = useCallback(async (url: string) => {
    if (!url) return;
    setIsSyncingInfo(true);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setInfo(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error sincronizando información:', err);
    } finally {
      setIsSyncingInfo(false);
    }
  }, []);

  const initialSync = useCallback(async (url: string, sUrl?: string, iUrl?: string) => {
    if (initialSyncDone.current) return;
    
    if (url) {
      setIsSyncing(true);
      try {
        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          processIncomingData(data);
        }
      } catch (err) {
        console.error('Error GET inicial:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    if (sUrl) {
      await syncServices(sUrl);
    }

    if (iUrl) {
      await syncInfo(iUrl);
    }

    initialSyncDone.current = true;
  }, [processIncomingData, syncServices, syncInfo]);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    let currentLeadsUrl = '';
    let currentServicesUrl = '';
    let currentInfoUrl = '';
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        currentLeadsUrl = settings.webhookUrl || '';
        currentServicesUrl = settings.servicesUrl || '';
        currentInfoUrl = settings.infoUrl || '';
        
        setWebhookUrl(currentLeadsUrl);
        setHistoryWebhookUrl(settings.historyWebhookUrl || '');
        setBotWebhookUrl(settings.botWebhookUrl || '');
        setInstanceName(settings.instanceName || 'HALCONDIGITAL');
        
        setServicesUrl(currentServicesUrl);
        setServicesEditUrl(settings.servicesEditUrl || '');
        setServicesCreateUrl(settings.servicesCreateUrl || '');
        setServicesDeleteUrl(settings.servicesDeleteUrl || '');

        setInfoUrl(currentInfoUrl);
        setInfoEditUrl(settings.infoEditUrl || '');
        setInfoCreateUrl(settings.infoCreateUrl || '');
        setInfoDeleteUrl(settings.infoDeleteUrl || '');
      } catch (e) {
        console.error("Error al cargar settings");
      }
    }
    
    setIsLoaded(true);

    if (currentLeadsUrl || currentServicesUrl || currentInfoUrl) {
      initialSync(currentLeadsUrl, currentServicesUrl, currentInfoUrl);
    }
  }, [initialSync]);

  const syncLeads = useCallback(async () => {
    if (!webhookUrl) return;
    setIsSyncing(true);
    try {
      const response = await fetch(webhookUrl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
      }
    } catch (err) {
      console.error('Error sincronizando leads (GET):', err);
    } finally {
      setIsSyncing(false);
    }
  }, [webhookUrl, processIncomingData]);

  const getHistory = useCallback(async (leadIdentifier: string): Promise<ChatMessage[]> => {
    if (!historyWebhookUrl || !leadIdentifier) return [];
    try {
      const url = new URL(historyWebhookUrl);
      url.searchParams.append('ID_LEAD', leadIdentifier);
      
      const response = await fetch(url.toString(), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        return (Array.isArray(data) ? data : []).map((msg: any) => ({
          id: msg.id?.toString() || Math.random().toString(36).substr(2, 9),
          message: msg.MENSAJE || "",
          fromMe: String(msg.DE_MI) === "1",
          timestamp: msg.createdAt || new Date().toISOString(),
          pushName: ""
        }));
      }
    } catch (err) {
      console.error('Error obteniendo historial:', err);
    }
    return [];
  }, [historyWebhookUrl]);

  const toggleBot = useCallback(async (whatsapp: string, status: boolean) => {
    if (!botWebhookUrl) return;
    
    setLeads(prev => prev.map(l => l.phone === whatsapp ? { ...l, botActive: status } : l));

    try {
      await fetch(botWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: whatsapp,
          ESTADO_BOT: status ? '1' : '0'
        })
      });
    } catch (err) {
      console.error('Error al cambiar estado del bot:', err);
    }
  }, [botWebhookUrl]);

  const createService = useCallback(async (serviceData: Omit<Service, 'id'>) => {
    if (!servicesCreateUrl) return;
    try {
      const response = await fetch(servicesCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      if (response.ok) {
        syncServices(servicesUrl);
      }
    } catch (err) {
      console.error('Error creando servicio:', err);
    }
  }, [servicesCreateUrl, servicesUrl, syncServices]);

  const updateService = useCallback(async (id: string, serviceData: Partial<Service>) => {
    if (!servicesEditUrl) return;
    try {
      const response = await fetch(servicesEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...serviceData })
      });
      if (response.ok) {
        syncServices(servicesUrl);
      }
    } catch (err) {
      console.error('Error editando servicio:', err);
    }
  }, [servicesEditUrl, servicesUrl, syncServices]);

  const deleteService = useCallback(async (id: string) => {
    if (!servicesDeleteUrl) return;
    try {
      const response = await fetch(servicesDeleteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        syncServices(servicesUrl);
      }
    } catch (err) {
      console.error('Error eliminando servicio:', err);
    }
  }, [servicesDeleteUrl, servicesUrl, syncServices]);

  const createInfo = useCallback(async (infoData: Omit<Info, 'id'>) => {
    if (!infoCreateUrl) return;
    try {
      const response = await fetch(infoCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoData)
      });
      if (response.ok) {
        syncInfo(infoUrl);
      }
    } catch (err) {
      console.error('Error creando información:', err);
    }
  }, [infoCreateUrl, infoUrl, syncInfo]);

  const updateInfo = useCallback(async (id: string, infoData: Partial<Info>) => {
    if (!infoEditUrl) return;
    try {
      const response = await fetch(infoEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...infoData })
      });
      if (response.ok) {
        syncInfo(infoUrl);
      }
    } catch (err) {
      console.error('Error editando información:', err);
    }
  }, [infoEditUrl, infoUrl, syncInfo]);

  const deleteInfo = useCallback(async (id: string) => {
    if (!infoDeleteUrl) return;
    try {
      const response = await fetch(infoDeleteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        syncInfo(infoUrl);
      }
    } catch (err) {
      console.error('Error eliminando información:', err);
    }
  }, [infoDeleteUrl, infoUrl, syncInfo]);

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const moveLead = useCallback((id: string, stageId: StageId) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: stageId, updatedAt: new Date().toISOString() } : l));
  }, []);

  const updateSettings = useCallback((newSettings: any) => {
    setWebhookUrl(newSettings.webhookUrl || '');
    setHistoryWebhookUrl(newSettings.historyWebhookUrl || '');
    setBotWebhookUrl(newSettings.botWebhookUrl || '');
    setInstanceName(newSettings.instanceName || 'HALCONDIGITAL');
    
    setServicesUrl(newSettings.servicesUrl || '');
    setServicesEditUrl(newSettings.servicesEditUrl || '');
    setServicesCreateUrl(newSettings.servicesCreateUrl || '');
    setServicesDeleteUrl(newSettings.servicesDeleteUrl || '');

    setInfoUrl(newSettings.infoUrl || '');
    setInfoEditUrl(newSettings.infoEditUrl || '');
    setInfoCreateUrl(newSettings.infoCreateUrl || '');
    setInfoDeleteUrl(newSettings.infoDeleteUrl || '');

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    initialSyncDone.current = false;
    initialSync(newSettings.webhookUrl, newSettings.servicesUrl, newSettings.infoUrl);
  }, [initialSync]);

  return { 
    leads, 
    services,
    info,
    webhookUrl, 
    historyWebhookUrl,
    botWebhookUrl,
    instanceName,
    servicesUrl,
    servicesEditUrl,
    servicesCreateUrl,
    servicesDeleteUrl,
    infoUrl,
    infoEditUrl,
    infoCreateUrl,
    infoDeleteUrl,
    isSyncing,
    isSyncingServices,
    isSyncingInfo,
    syncLeads,
    syncServices: () => syncServices(servicesUrl),
    syncInfo: () => syncInfo(infoUrl),
    getHistory,
    toggleBot,
    updateLead,
    deleteLead,
    moveLead,
    createService,
    updateService,
    deleteService,
    createInfo,
    updateInfo,
    deleteInfo,
    updateSettings, 
    isLoaded,
    processIncomingWebhook: processIncomingData
  };
}
