
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
    phone: '555-0101',
    company: 'TechCorp',
    stage: 'new',
    notes: 'Interesado en nuestro plan enterprise. Necesita una demostración para el próximo martes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Innovation Labs',
    contactName: 'Ana Smith',
    email: 'ana@innolabs.io',
    phone: '555-0102',
    company: 'Innovation Labs',
    stage: 'contacted',
    notes: 'Seguimiento por correo. Esperando respuesta sobre precios.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        setLeads(INITIAL_LEADS);
      }
    } else {
      setLeads(INITIAL_LEADS);
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { webhookUrl: url } = JSON.parse(savedSettings);
        setWebhookUrl(url || '');
      } catch (e) {
        setWebhookUrl('');
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

  const updateSettings = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ webhookUrl: url }));
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLeads([...leads, newLead]);

    // Llamada al Webhook si está configurado
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead.created',
          data: newLead,
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.error('Error enviando webhook:', err));
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

  return { 
    leads, 
    webhookUrl, 
    addLead, 
    updateLead, 
    deleteLead, 
    moveLead, 
    updateSettings, 
    isLoaded 
  };
}
