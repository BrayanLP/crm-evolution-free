
"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Lead, StageId, ChatMessage } from './types';

const SETTINGS_KEY = 'leadflow_settings';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [historyWebhookUrl, setHistoryWebhookUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('HALCONDIGITAL');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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
    }));

    setLeads(newLeadsFromWebhook);
  }, [instanceName]);

  const initialSync = useCallback(async (url: string) => {
    if (!url || initialSyncDone.current) return;
    setIsSyncing(true);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
        initialSyncDone.current = true;
      }
    } catch (err) {
      console.error('Error GET inicial:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [processIncomingData]);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    let currentUrl = '';
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        currentUrl = settings.webhookUrl || '';
        setWebhookUrl(currentUrl);
        setHistoryWebhookUrl(settings.historyWebhookUrl || '');
        setInstanceName(settings.instanceName || 'HALCONDIGITAL');
      } catch (e) {
        console.error("Error al cargar settings");
      }
    }
    setLeads([]);
    setIsLoaded(true);

    if (currentUrl) {
      initialSync(currentUrl);
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
      console.error('Error sincronizando (GET):', err);
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
          fromMe: msg.DE_MI === "1",
          timestamp: msg.createdAt || new Date().toISOString(),
          pushName: ""
        }));
      }
    } catch (err) {
      console.error('Error obteniendo historial:', err);
    }
    return [];
  }, [historyWebhookUrl]);

  const updateSettings = useCallback((url: string, historyUrl: string, inst: string) => {
    setWebhookUrl(url);
    setHistoryWebhookUrl(historyUrl);
    setInstanceName(inst);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ 
      webhookUrl: url, 
      historyWebhookUrl: historyUrl,
      instanceName: inst 
    }));
    initialSyncDone.current = false;
    if (url) initialSync(url);
  }, [initialSync]);

  return { 
    leads, 
    webhookUrl, 
    historyWebhookUrl,
    instanceName,
    isSyncing,
    syncLeads,
    getHistory,
    updateSettings, 
    isLoaded,
    processIncomingWebhook: processIncomingData
  };
}
