
"use client"

import { useState, useEffect } from 'react';
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
  },
  {
    id: '2',
    name: 'Innovate S.A.',
    contactName: 'María García',
    email: 'm.garcia@innovate.es',
    phone: '51988776655',
    company: 'Innovate S.A.',
    stage: 'contacted',
    notes: 'Primer contacto realizado por teléfono. Enviado catálogo de servicios.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Proyecto Alpha',
    contactName: 'Carlos Ruiz',
    email: 'cruiz@alpha.com',
    phone: '51922334455',
    company: 'Alpha Corp',
    stage: 'qualified',
    notes: 'Lead cualificado. Tiene presupuesto aprobado y busca implementación inmediata.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('HALCONDIGITAL');
  const [isLoaded, setIsLoaded] = useState(false);

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

  const formatToWebhook = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    
    return [
      {
        "INSTANCE": instanceName,
        "REMOTEJID": `${cleanPhone}@s.whatsapp.net`,
        "REMOTEJIDALT": `${cleanPhone}@s.whatsapp.net`,
        "PUSHNAME": lead.contactName || lead.name,
        "MESSAGE": lead.notes || "Nuevo lead creado desde CRM",
        "TYPO_MESSAGE": "conversation",
        "WHATSAPP": parseInt(cleanPhone) || 0,
        "ESTADO_RESPUESTA": "LISTO",
        "ESTADO_BOT": true,
        "id": lead.id,
        "createdAt": lead.createdAt,
        "updatedAt": lead.updatedAt
      }
    ];
  };

  const sendWebhook = async (payload: any) => {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Error enviando webhook:', err);
    }
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLeads([...leads, newLead]);

    if (webhookUrl) {
      sendWebhook(formatToWebhook(newLead));
    }
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

  const testWebhook = () => {
    const testLead: Lead = {
      id: "test-id",
      name: "Prueba de Webhook",
      contactName: "Brayan Developer",
      email: "test@example.com",
      phone: "51975521788",
      company: "Halcon Digital",
      stage: 'new',
      notes: "hola qué tal",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return sendWebhook(formatToWebhook(testLead));
  };

  return { 
    leads, 
    webhookUrl, 
    instanceName,
    addLead, 
    updateLead, 
    deleteLead, 
    moveLead, 
    updateSettings, 
    testWebhook,
    isLoaded 
  };
}
