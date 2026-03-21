
"use client"

import { useState, useEffect, useCallback } from 'react';
import type { Lead, StageId } from './types';

const STORAGE_KEY = 'leadflow_leads';
const SETTINGS_KEY = 'leadflow_settings';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('HALCONDIGITAL');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Cargar configuración inicial desde localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    let currentUrl = '';
    if (savedSettings) {
      try {
        const { webhookUrl: url, instanceName: inst } = JSON.parse(savedSettings);
        currentUrl = url || '';
        setWebhookUrl(currentUrl);
        setInstanceName(inst || 'HALCONDIGITAL');
      } catch (e) {
        setWebhookUrl('');
        setInstanceName('HALCONDIGITAL');
      }
    }

    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        // Al iniciar, cargamos lo que tenemos guardado localmente
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        setLeads([]);
      }
    } else {
      // Si no hay nada guardado, empezamos con una lista vacía (sin data de prueba)
      setLeads([]);
    }

    setIsLoaded(true);

    // Intentar sincronización inicial por GET si hay URL configurada
    if (currentUrl) {
      initialSync(currentUrl);
    }
  }, []);

  // Persistir leads localmente cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

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
      // Evitar duplicados basados en ID
      const existingIds = new Set(prev.map(l => l.id));
      const filteredNew = newLeadsFromWebhook.filter(l => !existingIds.has(l.id));
      return [...filteredNew, ...prev];
    });
  }, [instanceName]);

  const initialSync = async (url: string) => {
    if (!url) return;
    setIsSyncing(true);
    try {
      // PETICIÓN GET EXPLÍCITA
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
      }
    } catch (err) {
      console.error('Error en sincronización inicial GET:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncLeads = async () => {
    if (!webhookUrl) return;
    setIsSyncing(true);
    try {
      // PETICIÓN GET EXPLÍCITA
      const response = await fetch(webhookUrl, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        processIncomingData(data);
      }
    } catch (err) {
      console.error('Error sincronizando desde el webhook (GET):', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSettings = (url: string, inst: string) => {
    setWebhookUrl(url);
    setInstanceName(inst);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ webhookUrl: url, instanceName: inst }));
    // Sincronizar inmediatamente al guardar nueva URL usando GET
    if (url) initialSync(url);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLeads(prev => [newLead, ...prev]);
    
    // El envío al webhook sigue siendo POST para "notificar" la creación de un nuevo lead si es necesario
    if (webhookUrl) {
      const cleanPhone = newLead.phone.replace(/\D/g, '');
      const payload = [{
        "INSTANCE": instanceName,
        "REMOTEJID": `${cleanPhone}@s.whatsapp.net`,
        "REMOTEJIDALT": `${cleanPhone}@s.whatsapp.net`,
        "PUSHNAME": newLead.contactName || newLead.name,
        "MESSAGE": newLead.notes || "Nuevo lead creado manualmente",
        "TYPO_MESSAGE": "conversation",
        "WHATSAPP": parseInt(cleanPhone) || 0,
        "ESTADO_RESPUESTA": "LISTO",
        "ESTADO_BOT": true,
        "id": newLead.id,
        "createdAt": newLead.createdAt,
        "updatedAt": newLead.updatedAt
      }];

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(e => console.error("Error enviando lead al webhook (POST):", e));
    }
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const moveLead = (id: string, newStage: StageId) => {
    updateLead(id, { stage: newStage });
  };

  const testWebhook = async () => {
    if (!webhookUrl) return;
    // Función de prueba enviando la estructura por POST
    try {
      const testPayload = [{
        "INSTANCE": instanceName,
        "REMOTEJID": "51975521788@s.whatsapp.net",
        "PUSHNAME": "Test Connection",
        "MESSAGE": "Prueba de conexión desde CRM",
        "WHATSAPP": 51975521788,
        "id": "test-" + Date.now()
      }];
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });
    } catch (e) {
      console.error("Error en test de webhook:", e);
    }
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
    testWebhook,
    processIncomingWebhook: processIncomingData,
    isLoaded 
  };
}
