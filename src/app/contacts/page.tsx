
"use client"

import { useState, useEffect, useRef, useMemo } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, MessageSquare, User, History as HistoryIcon, Bot, Briefcase, Info, Filter, Calendar } from 'lucide-react';
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

export default function ContactsPage() {
  const { leads, getHistory, historyWebhookUrl, toggleBot, botWebhookUrl } = useLeads();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isBotActive, setIsBotActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [botFilter, setBotFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrado y Ordenación Descendente
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
          }
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
        <div className="p-6">
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

        <div className="mt-auto p-6 border-t">
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label={t('nav.settings')} 
            href="/settings"
            active={pathname === "/settings"}
          />
        </div>
      </aside>

      <main className="flex-1 flex min-w-0">
        <div className="w-80 border-r bg-white flex flex-col shadow-sm">
          <div className="p-4 border-b space-y-3">
            <h2 className="text-xl font-bold">{t('contacts.title')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9 bg-slate-50 border-none h-9 text-xs" 
                placeholder={t('contacts.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <Select value={botFilter} onValueChange={(val: any) => setBotFilter(val)}>
                  <SelectTrigger className="h-8 bg-slate-50 border-none text-[10px] shadow-none p-2">
                    <SelectValue placeholder={t('leads.filterBot')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{t('leads.botAll')}</SelectItem>
                    <SelectItem value="active" className="text-xs">{t('leads.botActive')}</SelectItem>
                    <SelectItem value="inactive" className="text-xs">{t('leads.botInactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                  <SelectTrigger className="h-8 bg-slate-50 border-none text-[10px] shadow-none p-2">
                    <SelectValue placeholder={t('leads.filterDate')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{t('leads.dateAll')}</SelectItem>
                    <SelectItem value="today" className="text-xs">{t('leads.dateToday')}</SelectItem>
                    <SelectItem value="week" className="text-xs">{t('leads.dateWeek')}</SelectItem>
                    <SelectItem value="month" className="text-xs">{t('leads.dateMonth')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-3 border-r-4 border-transparent",
                    selectedLead?.id === lead.id && "bg-primary/5 border-r-primary"
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
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm truncate text-slate-800">{lead.contactName}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                  </div>
                </div>
              ))}
              {filteredLeads.length === 0 && (
                <div className="p-8 text-center opacity-40">
                  <User className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs">{t('contacts.empty')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedLead ? (
            <>
              <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selectedLead.contactName}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                        {t(`stages.${selectedLead.stage}`).toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('contacts.active')}
                      </span>
                    </div>
                  </div>
                </div>

                {botWebhookUrl && (
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border">
                    <Bot className={cn("h-4 w-4", isBotActive ? "text-primary" : "text-muted-foreground")} />
                    <Label htmlFor="bot-mode" className="text-xs font-semibold cursor-pointer">
                      {t('contacts.botIA')}
                    </Label>
                    <Switch 
                      id="bot-mode" 
                      checked={isBotActive} 
                      onCheckedChange={handleBotToggle}
                    />
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 p-6">
                {!historyWebhookUrl ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-2">
                    <HistoryIcon className="h-12 w-12" />
                    <p className="text-sm font-medium">{t('contacts.noHistory')}</p>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto flex flex-col">
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
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-20 opacity-30">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">{t('contacts.emptyHistory')}</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 bg-white border-t text-center">
                <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  {t('contacts.viewMode')}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold">{t('contacts.selectLead')}</h3>
              <p className="text-sm">{t('contacts.selectLeadDesc')}</p>
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  href,
  active = false
}: { 
  icon: React.ReactNode, 
  label: string, 
  href: string,
  active?: boolean
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "w-full justify-start gap-3 px-4 py-6 text-base font-medium transition-all duration-200 flex items-center",
        active ? "bg-primary/5 text-primary shadow-sm hover:bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      {label}
      {active && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </Link>
  );
}
