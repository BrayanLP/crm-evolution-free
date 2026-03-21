
"use client"

import { useState, useEffect, useCallback } from 'react';
import type { Lead, StageId } from './types';

const STORAGE_KEY = 'leadflow_leads';
const SETTINGS_KEY = 'leadflow_settings';

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    contactName: 'Juan Pérez',
    email: 'juan@techcorp.com',
    phone: '51975521788',
    company: 'TechCorp',
    stage: 'new',
    notes: 'Interesado en nuestro plan enterprise. Necesita una demostración para el próximo martes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('HALCONDIGITAL');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        const parsed = JSON.parse(savedLeads);
        setLeads(parsed.length > 0 ? parsed : INITIAL_LEADS);
      } catch (e) {
        setLeads(INITIAL_LEADS);
      }
    } else {
      setLeads(INITIAL_LEADS);
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { webhookUrl: url, instanceName: inst } = JSON.parse(savedSettings);
        setWebhookUrl(url || '');
        setInstanceName(inst || 'HALCONDIGITAL');
      } catch (e) {
        setWebhookUrl('');
        setInstanceName('HALCONDIGITAL');
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

  const updateSettings = (url: string, inst: string) => {
    setWebhookUrl(url);
    setInstanceName(inst);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ webhookUrl: url, instanceName: inst }));
  };

  const processIncomingData = useCallback((payload: any[]) => {
    if (!Array.isArray(payload)) return;
    
    const newLeadsFromWebhook = payload.map(incoming => ({
      id: incoming.id?.toString() || Math.random().toString(36).substr(2, 9),
      name: incoming.PUSHNAME || "Nuevo Prospecto WhatsApp",
      contactName: incoming.PUSHNAME || "Sin Nombre",
      email: "",
      phone: incoming.WHATSAPP?.toString() || incoming.REMOTEJID?.split('@')[0] || "",
      company: incoming.INSTANCE || instanceName,
      stage: 'new' as StageId,
      notes: incoming.MESSAGE || "Sin mensaje",
      createdAt: incoming.createdAt || new Date().toISOString(),
      updatedAt: incoming.updatedAt || new Date().toISOString(),
    }));

    setLeads(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const filteredNew = newLeadsFromWebhook.filter(l => !existingIds.has(l.id));
      return [...filteredNew, ...prev];
    });
  }, [instanceName]);

  const syncLeads = async () => {
    if (!webhookUrl) return;
    setIsSyncing(true);
    try {
      // Intentamos obtener la data real del servicio
      const response = await fetch(webhookUrl);
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
      }
    } catch (err) {
      console.error('Error sincronizando desde el webhook:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const sendWebhook = async (lead: Lead) => {
    if (!webhookUrl) return;
    
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const payload = [{
      "INSTANCE": instanceName,
      "REMOTEJID": `${cleanPhone}@s.whatsapp.net`,
      "REMOTEJIDALT": `${cleanPhone}@s.whatsapp.net`,
      "PUSHNAME": lead.contactName || lead.name,
      "MESSAGE": lead.notes || "Nuevo lead",
      "TYPO_MESSAGE": "conversation",
      "WHATSAPP": parseInt(cleanPhone) || 0,
      "ESTADO_RESPUESTA": "LISTO",
      "ESTADO_BOT": true,
      "id": lead.id,
      "createdAt": lead.createdAt,
      "updatedAt": lead.updatedAt
    }];

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Error enviando a webhook:', err);
    }
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLeads(prev => [...prev, newLead]);
    sendWebhook(newLead);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const moveLead = (id: string, newStage: StageId) => {
    updateLead(id, { stage: newStage });
  };

  return { 
    leads, 
    webhookUrl, 
    instanceName,
    isSyncing,
    addLead, 
    updateLead, 
    deleteLead, 
    moveLead, 
    updateSettings, 
    syncLeads,
    processIncomingWebhook: processIncomingData,
    isLoaded 
  };
}
