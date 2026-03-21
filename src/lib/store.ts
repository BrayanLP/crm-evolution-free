
"use client"

import { useState, useEffect } from 'react';
import type { Lead, StageId } from './types';

const STORAGE_KEY = 'leadflow_leads';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch (e) {
        setLeads(INITIAL_LEADS);
      }
    } else {
      setLeads(INITIAL_LEADS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
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

  return { leads, addLead, updateLead, deleteLead, moveLead, isLoaded };
}
