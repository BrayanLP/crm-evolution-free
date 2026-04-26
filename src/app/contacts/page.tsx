
"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, MessageSquare, User, History as HistoryIcon, Bot, Briefcase, Info, Filter, Calendar, Menu, ArrowLeft, Image as ImageIcon, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lead, ChatMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileNav } from '@/components/MobileNav';

export default function ContactsPage() {
  const { leads, getHistory, historyWebhookUrl, toggleBot, leadEditUrl, accounts, activeAccount, setActiveAccountId } = useLeads();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isBotActive, setIsBotActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [botFilter, setBotFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | '60days' | '90days'>('all');
  
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatDriveUrl = useCallback((url: string, type: 'view' | 'embed' = 'embed') => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        if (type === 'view') {
          return `https://drive.google.com/file/d/${match[1]}/view?usp=drivesdk`;
        }
        return `https://drive.google.com/uc?id=${match[1]}`;
      }
    }
    return url;
  }, []);

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
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
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [leads, searchQuery, botFilter, dateFilter]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    async function fetchHistory() {
      if (selectedLead?.phone) {
        setIsLoadingHistory(true);
        const history = await getHistory(selectedLead.phone);
        setMessages(history);
        setIsLoadingHistory(false);
        setIsBotActive(selectedLead.botActive !== false);
      } else {
        setMessages([]);
      }
    }
    fetchHistory();
  }, [selectedLead, getHistory]);

  const handleBotToggle = (checked: boolean) => {
    if (selectedLead?.phone) {
      setIsBotActive(checked);
      toggleBot(selectedLead.phone, checked).then(() => {
        toast({
          title: checked ? t('leads.botOn') : t('leads.botOff'),
          description: t('leads.botDesc').replace('{name}', selectedLead.contactName),
          variant: "success",
        });
      });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutGrid className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-headline">LeadFlow</span>
          </div>
          <nav className="space-y-1">
            <NavItem icon={<PieChart className="h-5 w-5" />} label={t('nav.dashboard')} href="/" active={pathname === "/"} />
            <NavItem icon={<LayoutGrid className="h-5 w-5" />} label={t('nav.leads')} href="/leads" active={pathname === "/leads"} />
            <NavItem icon={<Users className="h-5 w-5" />} label={t('nav.contacts')} href="/contacts" active={pathname === "/contacts"} />
            <NavItem icon={<Briefcase className="h-5 w-5" />} label={t('nav.services')} href="/services" active={pathname === "/services"} />
            <NavItem icon={<Info className="h-5 w-5" />} label={t('nav.info')} href="/info" active={pathname === "/info"} />
          </nav>
        </div>

        {accounts.length > 0 && (
          <div className="px-6 py-4 border-y bg-slate-50/50">
             <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Cuenta Activa</label>
             <Select value={activeAccount?.id} onValueChange={setActiveAccountId}>
               <SelectTrigger className="h-10 bg-white border-slate-200 text-xs font-bold shadow-none">
                 <Smartphone className="h-3.5 w-3.5 mr-2 text-primary" />
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {accounts.map(acc => (
                   <SelectItem key={acc.id} value={acc.id} className="text-xs font-bold">{acc.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
        )}

        <div className="mt-auto p-6 border-t">
          <NavItem icon={<Settings className="h-5 w-5" />} label={t('nav.settings')} href="/settings" active={pathname === "/settings"} />
        </div>
      </aside>

      <main className="flex-1 flex min-w-0 flex-col md:flex-row">
        <div className={cn(
          "w-full md:w-80 border-r bg-white flex flex-col shadow-sm h-full",
          selectedLead ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MobileNav />
                <h2 className="text-xl font-black tracking-tight">{t('contacts.title')}</h2>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-50 border-none h-10 text-xs shadow-none focus-visible:ring-1" 
                placeholder={t('contacts.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={botFilter} onValueChange={(val: any) => setBotFilter(val)}>
                  <SelectTrigger className="h-8 bg-slate-50 border-none text-[10px] shadow-none p-2">
                    <Filter className="h-3 w-3 mr-1.5 text-slate-400" />
                    <SelectValue placeholder={t('leads.filterBot')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{t('leads.botAll')}</SelectItem>
                    <SelectItem value="active" className="text-xs">{t('leads.botActive')}</SelectItem>
                    <SelectItem value="inactive" className="text-xs">{t('leads.botInactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                  <SelectTrigger className="h-8 bg-slate-50 border-none text-[10px] shadow-none p-2">
                    <Calendar className="h-3 w-3 mr-1.5 text-slate-400" />
                    <SelectValue placeholder={t('leads.filterDate')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{t('leads.dateAll')}</SelectItem>
                    <SelectItem value="today" className="text-xs">{t('leads.dateToday')}</SelectItem>
                    <SelectItem value="week" className="text-xs">{t('leads.dateWeek')}</SelectItem>
                    <SelectItem value="month" className="text-xs">{t('leads.dateMonth')}</SelectItem>
                    <SelectItem value="60days" className="text-xs">{t('leads.date60')}</SelectItem>
                    <SelectItem value="90days" className="text-xs">{t('leads.date90')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-3 border-l-4 border-transparent",
                    selectedLead?.id === lead.id && "bg-primary/5 border-l-primary"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 relative">
                    <User className="h-5 w-5 text-slate-400" />
                    {lead.botActive !== false && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                        <Bot className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold text-sm truncate text-slate-800 tracking-tight">{lead.contactName}</p>
                      <span className="text-[9px] font-bold text-slate-400">
                        {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground truncate">{lead.phone}</p>
                      <Badge variant="outline" className="text-[8px] py-0 px-1 font-black bg-slate-50 border-slate-200">
                        {t(`stages.${lead.stage}`).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLeads.length === 0 && (
                <div className="p-12 text-center opacity-30 space-y-2">
                  <User className="h-10 w-10 mx-auto" />
                  <p className="text-xs font-bold uppercase tracking-widest">{t('contacts.empty')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className={cn(
          "flex-1 flex flex-col bg-slate-50 h-full relative",
          !selectedLead ? "hidden md:flex" : "flex"
        )}>
          {selectedLead ? (
            <>
              <div className="h-16 md:h-20 border-b bg-white flex items-center justify-between px-4 md:px-8 shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="h-9 w-9 md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-sm md:text-base leading-tight tracking-tight">{selectedLead.contactName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-500 font-black flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('contacts.active')}
                      </span>
                    </div>
                  </div>
                </div>

                {leadEditUrl && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <Bot className={cn("h-4 w-4", isBotActive ? "text-primary" : "text-slate-400")} />
                    <Switch 
                      id="bot-mode" 
                      checked={isBotActive} 
                      onCheckedChange={handleBotToggle}
                      className="scale-75 md:scale-90"
                    />
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 p-4 md:p-8 bg-[#e5ddd5]/30">
                {!historyWebhookUrl ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-3">
                    <HistoryIcon className="h-14 w-14" />
                    <p className="text-sm font-black uppercase tracking-widest">{t('contacts.noHistory')}</p>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto flex flex-col">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[85%] md:max-w-[70%]",
                          msg.fromMe ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-2xl text-[13px] md:text-sm shadow-sm overflow-hidden",
                            msg.fromMe 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-white text-slate-800 rounded-tl-none border border-slate-200/50"
                          )}
                        >
                          {msg.type === 'imageMessage' ? (
                            <div className="flex flex-col gap-2 p-1">
                              <div className="relative group overflow-hidden rounded-lg bg-slate-100/50 flex flex-col items-center justify-center min-h-[120px] border border-slate-200/20">
                                <img 
                                  src={formatDriveUrl(msg.message, 'embed')} 
                                  alt="WhatsApp Preview" 
                                  className="max-h-[300px] w-auto object-contain cursor-pointer hover:scale-[1.01] transition-transform"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as any).style.display = 'none';
                                    const parent = (e.target as any).parentNode;
                                    if (parent) {
                                      const errorDiv = parent.querySelector('.error-indicator');
                                      if (errorDiv) errorDiv.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="error-indicator hidden flex-col items-center gap-2 p-6 text-slate-400">
                                  <ImageIcon className="h-8 w-8 opacity-50" />
                                  <span className="text-[10px] font-bold text-center uppercase tracking-tighter">Vista previa no disponible</span>
                                </div>
                              </div>
                              <a 
                                href={formatDriveUrl(msg.message, 'view')} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                                  msg.fromMe 
                                    ? "bg-white/20 text-white hover:bg-white/30 border border-white/10" 
                                    : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20"
                                )}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Ver Imagen Original
                              </a>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-20 opacity-20 space-y-2">
                        <MessageSquare className="h-14 w-14 mx-auto" />
                        <p className="text-sm font-black uppercase tracking-widest">{t('contacts.emptyHistory')}</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 bg-white border-t text-center shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                <p className="text-[10px] md:text-xs text-slate-500 font-black italic flex items-center justify-center gap-2 uppercase tracking-tight">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t('contacts.viewMode')}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-8 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-200 flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-slate-400" />
              </div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-2">{t('contacts.selectLead')}</h3>
              <p className="text-xs md:text-sm font-medium">{t('contacts.selectLeadDesc')}</p>
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center rounded-md",
        active ? "bg-primary/5 text-primary shadow-sm hover:bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      {label}
      {active && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </Link>
  );
}
