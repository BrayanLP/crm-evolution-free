
"use client"

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useLeads } from '@/lib/store';
import { STAGES, Lead, StageId } from '@/lib/types';
import { LeadDialog } from './LeadDialog';
import { Phone, RefreshCw, AlertCircle, Bot, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';

interface KanbanBoardProps {
  searchQuery?: string;
  botFilter?: 'all' | 'active' | 'inactive';
  dateFilter?: 'all' | 'today' | 'week' | 'month' | '60days' | '90days';
}

export function KanbanBoard({ 
  searchQuery = '', 
  botFilter = 'all',
  dateFilter = 'all'
}: KanbanBoardProps) {
  const { leads, updateLead, deleteLead, moveLead, syncLeads, toggleBot, isSyncing, isLoaded, webhookUrl, botWebhookUrl } = useLeads();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Filtro de búsqueda
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.contactName.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q));
      
      // Filtro de Bot
      const matchesBot = 
        botFilter === 'all' || 
        (botFilter === 'active' && lead.botActive !== false) || 
        (botFilter === 'inactive' && lead.botActive === false);

      // Filtro de Fecha (usando updatedAt)
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const leadDate = new Date(lead.updatedAt);
        const now = new Date();
        if (dateFilter === 'today') {
          matchesDate = leadDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = leadDate >= sevenDaysAgo;
        } else if (dateFilter === 'month') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = leadDate >= thirtyDaysAgo;
        } else if (dateFilter === '60days') {
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(now.getDate() - 60);
          matchesDate = leadDate >= sixtyDaysAgo;
        } else if (dateFilter === '90days') {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          matchesDate = leadDate >= ninetyDaysAgo;
        }
      }

      return matchesSearch && matchesBot && matchesDate;
    });
  }, [leads, searchQuery, botFilter, dateFilter]);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
    setDraggingLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    moveLead(id, stageId);
    setDraggingLeadId(null);
  };

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">{t('leads.title')}</h1>
          <p className="text-muted-foreground">{t('leads.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={syncLeads} 
            disabled={isSyncing || !webhookUrl}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {t('leads.sync')}
          </Button>
        </div>
      </div>

      {!webhookUrl && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('leads.configPending')}</AlertTitle>
          <AlertDescription>
            {t('leads.configPendingDesc')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-max">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads
              .filter((l) => l.stage === stage.id)
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            const totalBudget = stageLeads.reduce((acc, lead) => {
              const value = typeof lead.budget === 'string' 
                ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) 
                : (typeof lead.budget === 'number' ? lead.budget : 0);
              return acc + (isNaN(value) ? 0 : value);
            }, 0);

            return (
              <div
                key={stage.id}
                className="flex flex-col w-80 rounded-xl bg-slate-100/50 border border-border"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-4 border-b border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", stage.color)} />
                      <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700">
                        {t(`stages.${stage.id}`)}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <DollarSign className="h-3 w-3" />
                    <span>S/ {totalBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-3 py-4 scrollbar-hide">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => setDraggingLeadId(null)}
                      onClick={() => openEditDialog(lead)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-l-4 bg-white",
                        draggingLeadId === lead.id ? "opacity-40 scale-95" : "opacity-100",
                        stage.id === 'new' ? "border-l-blue-500" :
                        stage.id === 'contacted' ? "border-l-amber-500" :
                        stage.id === 'qualified' ? "border-l-emerald-500" : "border-l-accent"
                      )}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                            {lead.contactName}
                          </h3>
                        </div>
                        
                        <div className="space-y-1.5">
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                          {botWebhookUrl && (
                            <div 
                              className="flex items-center gap-1.5" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Bot className={cn("h-3.5 w-3.5", lead.botActive !== false ? "text-primary" : "text-slate-300")} />
                              <Switch 
                                checked={lead.botActive !== false} 
                                onCheckedChange={(checked) => toggleBot(lead.phone, checked).then(() => {
                                  toast({
                                    title: checked ? t('leads.botOn') : t('leads.botOff'),
                                    description: t('leads.botDesc').replace('{name}', lead.contactName),
                                    variant: "success",
                                  });
                                })}
                                className="scale-75"
                              />
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(lead.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">{t('leads.emptyStage')}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LeadDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        lead={selectedLead}
        onSave={(data) => {
          if (selectedLead) {
            updateLead(selectedLead.id, data);
          }
        }}
        onDelete={deleteLead}
      />
    </div>
  );
}
