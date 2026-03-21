
"use client"

import { useState, useEffect } from 'react';
import { useLeads } from '@/lib/store';
import { SettingsDialog } from '@/components/SettingsDialog';
import { LayoutGrid, Users, Settings, PieChart, Bell, Search, MessageSquare, Send, User, Smartphone, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lead, ChatMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function ContactsPage() {
  const { leads, getHistory, historyWebhookUrl } = useLeads();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchHistory() {
      if (selectedLead?.id) {
        setIsLoadingHistory(true);
        const history = await getHistory(selectedLead.id);
        setMessages(history);
        setIsLoadingHistory(false);
      } else {
        setMessages([]);
      }
    }
    fetchHistory();
  }, [selectedLead, getHistory]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutGrid className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-headline">LeadFlow</span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<PieChart className="h-5 w-5" />} label="Panel" href="/" />
            <NavItem icon={<LayoutGrid className="h-5 w-5" />} label="Leads" href="/" />
            <NavItem icon={<Users className="h-5 w-5" />} label="Contactos" href="/contacts" active={pathname === "/contacts"} />
            <NavItem icon={<Bell className="h-5 w-5" />} label="Actividades" href="/" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t">
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Configuración" 
            onClick={() => setIsSettingsOpen(true)}
          />
          <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">Alex Director</span>
              <span className="text-[10px] text-muted-foreground uppercase">ADMINISTRADOR</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex min-w-0">
        {/* Contacts List */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Chat de Leads</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 bg-slate-50" placeholder="Buscar contacto..." />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3",
                    selectedLead?.id === lead.id && "bg-primary/5 border-r-4 border-primary"
                  )}
                >
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${lead.id}/100/100`} />
                    <AvatarFallback>{lead.contactName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm truncate">{lead.contactName}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {lead.updatedAt ? new Date(lead.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{lead.notes}</p>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center opacity-40">
                  <User className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs">No hay contactos disponibles</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://picsum.photos/seed/${selectedLead.id}/100/100`} />
                    <AvatarFallback>{selectedLead.contactName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{selectedLead.contactName}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                        {selectedLead.stage.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        WhatsApp Activo
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Smartphone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <History className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <ScrollArea className="flex-1 p-6">
                {!historyWebhookUrl ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-2">
                    <History className="h-12 w-12" />
                    <p className="text-sm font-medium">Configura el Webhook de Historial en Ajustes</p>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.fromMe ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-2xl text-sm shadow-sm",
                            msg.fromMe 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-white text-slate-800 rounded-tl-none border"
                          )}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-20 opacity-30">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Sin historial de mensajes</p>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t">
                <div className="max-w-4xl mx-auto flex gap-2">
                  <Input 
                    className="flex-1 bg-slate-50 border-none focus-visible:ring-1" 
                    placeholder="Escribe un mensaje..." 
                  />
                  <Button size="icon" className="rounded-full shadow-md bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold">Selecciona un contacto</h3>
              <p className="text-sm">Elige un lead de la lista para ver su historial de WhatsApp</p>
            </div>
          )}
        </div>
      </main>
      
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <Toaster />
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  href,
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  href?: string,
  active?: boolean,
  onClick?: () => void
}) {
  const content = (
    <>
      {icon}
      {label}
      {active && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </>
  );

  const className = cn(
    "w-full justify-start gap-3 px-4 py-6 text-base font-medium transition-all duration-200 flex items-center",
    active ? "bg-primary/5 text-primary shadow-sm hover:bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <Button variant="ghost" onClick={onClick} className={className}>
      {content}
    </Button>
  );
}
