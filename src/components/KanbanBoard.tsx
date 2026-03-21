
"use client"

import * as React from 'react';
import { useState } from 'react';
import { useLeads } from '@/lib/store';
import { STAGES, Lead, StageId } from '@/lib/types';
import { LeadDialog } from './LeadDialog';
import { Plus, Building2, User, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function KanbanBoard() {
  const { leads, addLead, updateLead, deleteLead, moveLead, isLoaded } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

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

  const openCreateDialog = () => {
    setSelectedLead(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Pipeline</h1>
          <p className="text-muted-foreground">Gestiona tu proceso de ventas y prospectos de forma efectiva.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Añadir Prospecto
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-max">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="flex flex-col w-80 rounded-xl bg-slate-100/50 border border-border"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                    <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-600">
                      {stage.title}
                    </h2>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-3 pb-4 scrollbar-hide">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => setDraggingLeadId(null)}
                      onClick={() => openEditDialog(lead)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-l-4",
                        draggingLeadId === lead.id ? "opacity-40 scale-95" : "opacity-100",
                        stage.id === 'new' ? "border-l-blue-500" :
                        stage.id === 'contacted' ? "border-l-amber-500" :
                        stage.id === 'qualified' ? "border-l-emerald-500" : "border-l-accent"
                      )}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                            {lead.name}
                          </h3>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{lead.contactName}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {lead.email && (
                            <div className="bg-slate-100 p-1 rounded-sm text-slate-500" title={lead.email}>
                              <Mail className="h-3 w-3" />
                            </div>
                          )}
                          {lead.phone && (
                            <div className="bg-slate-100 p-1 rounded-sm text-slate-500" title={lead.phone}>
                              <Phone className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 italic bg-slate-50 p-1.5 rounded-md border border-slate-100">
                            "{lead.notes}"
                          </p>
                        )}

                        <div className="flex justify-end pt-1">
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
                      <p className="text-xs text-slate-500">No hay prospectos aquí</p>
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
          } else {
            addLead(data);
          }
        }}
        onDelete={deleteLead}
      />
    </div>
  );
}
