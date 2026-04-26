
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
  showAmounts?: boolean;
}

export function KanbanBoard({ 
  searchQuery = '', 
  botFilter = 'all',
  dateFilter = 'all',
  showAmounts = true
}: KanbanBoardProps) {
  const { leads, updateLead, deleteLead, moveLead, syncLeads, toggleBot, isSyncing, isLoaded, webhookUrl, leadEditUrl } = useLeads();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.contactName.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q));
      
      const matchesBot = 
        botFilter === 'all' || 
        (botFilter === 'active' && lead.botActive !== false) || 
        (botFilter === 'inactive' && lead.botActive === false);

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const leadDate = new Date(lead.updatedAt);
        const now = new Date();
        if (dateFilter === 'today') matchesDate = leadDate.toDateString() === now.toDateString();
        else if (dateFilter === 'week') { const d = new Date(); d.setDate(now.getDate() - 7); matchesDate = leadDate >= d; }
        else if (dateFilter === 'month') { const d = new Date(); d.setDate(now.getDate() - 30); matchesDate = leadDate >= d; }
        else if (dateFilter === '60days') { const d = new Date(); d.setDate(now.getDate() - 60); matchesDate = leadDate >= d; }
        else if (dateFilter === '90days') { const d = new Date(); d.setDate(now.getDate() - 90); matchesDate = leadDate >= d; }
      }

      return matchesSearch && matchesBot && matchesDate;
    });
  }, [leads, searchQuery, botFilter, dateFilter]);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
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
    <div className="flex flex-col h-full space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-headline text-primary tracking-tight">{t('leads.title')}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{t('leads.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={syncLeads} 
            disabled={isSyncing || !webhookUrl}
            className="gap-2 h-9 md:h-10 text-xs w-full md:w-auto"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
            {t('leads.sync')}
          </Button>
        </div>
      </div>

      {!webhookUrl && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800 p-3 md:p-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs md:text-sm font-bold">{t('leads.configPending')}</AlertTitle>
          <AlertDescription className="text-[10px] md:text-xs">
            {t('leads.configPendingDesc')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex h-full gap-3 md:gap-4 min-w-max pb-2">
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
                className="flex flex-col w-72 md:w-80 rounded-xl bg-slate-50 border border-slate-200/60"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-3 md:p-4 border-b border-slate-200/40 bg-white/50 rounded-t-xl">
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", stage.color)} />
                      <h2 className="font-black text-[10px] md:text-xs uppercase tracking-tighter md:tracking-wider text-slate-700">
                        {t(`stages.${stage.id}`)}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 font-black bg-slate-200 text-slate-700">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-primary">
                    <DollarSign className="h-3 w-3" />
                    <span className={cn(
                      "transition-all duration-300",
                      !showAmounts && "blur-sm select-none opacity-50"
                    )}>
                      S/ {totalBudget.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 md:px-3 space-y-2 md:space-y-3 py-3 md:py-4 scrollbar-hide">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => setDraggingLeadId(null)}
                      onClick={() => openEditDialog(lead)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-l-4 bg-white shadow-sm hover:border-r-slate-50",
                        draggingLeadId === lead.id ? "opacity-40 scale-95" : "opacity-100",
                        stage.id === 'new' ? "border-l-blue-500" :
                        stage.id === 'contacted' ? "border-l-amber-500" :
                        stage.id === 'qualified' ? "border-l-emerald-500" : "border-l-accent"
                      )}
                    >
                      <CardContent className="p-3 md:p-4 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-xs md:text-sm text-slate-800 leading-tight">
                            {lead.contactName}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <Phone className="h-2.5 w-2.5" />
                          <span className="truncate">{lead.phone}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                          {leadEditUrl && (
                            <div 
                              className="flex items-center gap-1.5" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Bot className={cn("h-3 w-3", lead.botActive !== false ? "text-primary" : "text-slate-300")} />
                              <Switch 
                                checked={lead.botActive !== false} 
                                onCheckedChange={(checked) => toggleBot(lead.phone, checked).then(() => {
                                  toast({
                                    title: checked ? t('leads.botOn') : t('leads.botOff'),
                                    description: t('leads.botDesc').replace('{name}', lead.contactName),
                                    variant: "success",
                                  });
                                })}
                                className="scale-[0.6] md:scale-75 h-4 w-8"
                              />
                            </div>
                          )}
                          <span className="text-[9px] text-slate-400 font-bold">
                            {new Date(lead.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('leads.emptyStage')}</p>
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
