
"use client"

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useLeads } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, AreaChart, Area } from 'recharts';
import { STAGES } from '@/lib/types';
import { Users, Target, UserCheck, MessageSquare, TrendingUp, Bot, Send, Calendar, DollarSign, Briefcase, Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { leads, isSyncing, isLoaded } = useLeads();
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | '60days' | '90days'>('all');
  const [showAmounts, setShowAmounts] = useState(true);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (dateFilter === 'all') return true;
      const leadDate = new Date(lead.updatedAt);
      const now = new Date();
      if (dateFilter === 'today') return leadDate.toDateString() === now.toDateString();
      if (dateFilter === 'week') {
        const d = new Date(); d.setDate(now.getDate() - 7);
        return leadDate >= d;
      }
      if (dateFilter === 'month') {
        const d = new Date(); d.setDate(now.getDate() - 30);
        return leadDate >= d;
      }
      if (dateFilter === '60days') {
        const d = new Date(); d.setDate(now.getDate() - 60);
        return leadDate >= d;
      }
      if (dateFilter === '90days') {
        const d = new Date(); d.setDate(now.getDate() - 90);
        return leadDate >= d;
      }
      return true;
    });
  }, [leads, dateFilter]);

  const wordCloudData = useMemo(() => {
    if (!filteredLeads.length) return [];
    
    // Stop words to exclude
    const stopWords = new Set([
      'de', 'la', 'el', 'que', 'en', 'los', 'un', 'con', 'por', 'para', 'una', 'las', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'este', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'nos', 'le', 'hay', 'ya', 'son', 'ser', 'si', 'mi', 'tiene', 'todo', 'esta', 'estos', 'estamos', 'estoy', 'hola', 'buenas', 'tardes', 'días', 'noches', 'favor', 'quisiera', 'necesito', 'gracias', 'gracias', 'clases', 'persona', 'personas',
      'the', 'and', 'for', 'with', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had', 'has', 'was', 'were', 'from', 'they', 'this', 'that', 'there', 'when', 'where', 'which', 'will'
    ]);

    const wordsMap: Record<string, number> = {};
    
    filteredLeads.forEach(lead => {
      if (!lead.notes) return;
      const words = lead.notes
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/);
      
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordsMap[word] = (wordsMap[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordsMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([text, value]) => ({ text, value }));
  }, [filteredLeads]);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const totalLeadsCount = filteredLeads.length;
  const contactedLeadsCount = filteredLeads.filter(l => l.stage !== 'new').length;
  const botActiveLeadsCount = filteredLeads.filter(l => l.botActive !== false).length;
  
  const pipelineValue = filteredLeads
    .filter(l => l.stage !== 'converted')
    .reduce((acc, lead) => {
      const value = typeof lead.budget === 'string' 
        ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) 
        : (typeof lead.budget === 'number' ? lead.budget : 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

  const convertedValue = filteredLeads
    .filter(l => l.stage === 'converted')
    .reduce((acc, lead) => {
      const value = typeof lead.budget === 'string' 
        ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) 
        : (typeof lead.budget === 'number' ? lead.budget : 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

  const convertedLeadsCount = filteredLeads.filter(l => l.stage === 'converted').length;
  const conversionRate = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : 0;

  const stageData = STAGES.map(stage => ({
    name: t(`stages.${stage.id}`),
    count: filteredLeads.filter(l => l.stage === stage.id).length,
    color: stage.id === 'new' ? '#3b82f6' : 
           stage.id === 'contacted' ? '#f59e0b' : 
           stage.id === 'qualified' ? '#10b981' : '#6366f1'
  }));

  const trendDaysCount = dateFilter === 'today' ? 1 : 
                        dateFilter === 'week' ? 7 : 
                        dateFilter === 'month' ? 30 : 
                        dateFilter === '60days' ? 60 : 
                        dateFilter === '90days' ? 90 : 7;

  const trendDates = Array.from({ length: trendDaysCount }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const trendData = trendDates.map(date => ({
    date: new Date(date).toLocaleDateString([], { day: 'numeric', month: 'short' }),
    leads: filteredLeads.filter(l => l.createdAt?.split('T')[0] === date).length
  }));

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-headline text-primary tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAmounts(!showAmounts)}
            className="h-10 w-10 flex-shrink-0"
          >
            {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 min-w-[160px] flex-1 md:flex-none">
            <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
              <SelectTrigger className="h-10 bg-white border-slate-200 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <SelectValue placeholder={t('leads.filterDate')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('leads.dateAll')}</SelectItem>
                <SelectItem value="today">{t('leads.dateToday')}</SelectItem>
                <SelectItem value="week">{t('leads.dateWeek')}</SelectItem>
                <SelectItem value="month">{t('leads.dateMonth')}</SelectItem>
                <SelectItem value="60days">{t('leads.date60')}</SelectItem>
                <SelectItem value="90days">{t('leads.date90')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isSyncing && (
             <div className="flex items-center gap-1.5 text-[10px] text-primary animate-pulse font-bold whitespace-nowrap">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               SYNCING
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <KpiCard 
          title={t('dashboard.kpi.pipelineValue')} 
          value={`S/ ${pipelineValue.toLocaleString()}`} 
          icon={<Briefcase className="h-4 w-4 text-blue-500" />} 
          description={t('dashboard.kpi.descPipelineValue')}
          highlight="blue"
          blurValue={!showAmounts}
        />
        <KpiCard 
          title={t('dashboard.kpi.convertedValue')} 
          value={`S/ ${convertedValue.toLocaleString()}`} 
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />} 
          description={t('dashboard.kpi.descConvertedValue')}
          highlight="emerald"
          blurValue={!showAmounts}
        />
        <KpiCard 
          title={t('dashboard.kpi.totalLeads')} 
          value={totalLeadsCount.toString()} 
          icon={<Users className="h-4 w-4 text-slate-500" />} 
          description={t('dashboard.kpi.descTotal')}
        />
        <KpiCard 
          title={t('dashboard.kpi.botActive')} 
          value={botActiveLeadsCount.toString()} 
          icon={<Bot className="h-4 w-4 text-purple-500" />} 
          description={t('dashboard.kpi.descBotActive')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">{t('dashboard.charts.words')}</CardTitle>
                <CardDescription className="text-xs">{t('dashboard.charts.wordsDesc')}</CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] flex items-center justify-center p-6 bg-slate-50/30">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 max-w-lg">
              {wordCloudData.map((item, i) => {
                const maxVal = Math.max(...wordCloudData.map(w => w.value));
                const scale = (item.value / maxVal);
                const fontSize = 12 + (scale * 24);
                const opacity = 0.4 + (scale * 0.6);
                
                return (
                  <span 
                    key={i} 
                    style={{ fontSize: `${fontSize}px`, opacity }}
                    className={cn(
                      "font-black tracking-tight cursor-default hover:scale-110 transition-transform uppercase leading-none",
                      i % 4 === 0 ? "text-primary" : 
                      i % 4 === 1 ? "text-amber-500" : 
                      i % 4 === 2 ? "text-emerald-500" : "text-indigo-500"
                    )}
                  >
                    {item.text}
                  </span>
                )
              })}
              {wordCloudData.length === 0 && (
                <div className="text-center opacity-30 italic text-xs uppercase font-black tracking-widest">
                  Sin datos suficientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">{t('dashboard.charts.activity')}</CardTitle>
                <CardDescription className="text-xs">{t('dashboard.charts.activityDesc')}</CardDescription>
              </div>
              <div className="bg-primary/10 p-1.5 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">{t('dashboard.charts.health')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[250px] flex items-center justify-center p-0">
             <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-4 pb-4 grid grid-cols-2 gap-1.5">
            {stageData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-0">
            <CardTitle className="text-base md:text-lg">{t('dashboard.charts.funnel')}</CardTitle>
            <CardDescription className="text-xs">{t('dashboard.charts.funnelDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-2 md:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">{t('dashboard.recentLeads.title')}</CardTitle>
          <CardDescription className="text-xs">{t('dashboard.recentLeads.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {lead.contactName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[150px]">{lead.contactName}</p>
                    <p className="text-[10px] text-muted-foreground">{lead.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter",
                    lead.stage === 'new' ? "bg-blue-100 text-blue-700" :
                    lead.stage === 'contacted' ? "bg-amber-100 text-amber-700" :
                    lead.stage === 'qualified' ? "bg-emerald-100 text-emerald-700" :
                    "bg-indigo-100 text-indigo-700"
                  )}>
                    {t(`stages.${lead.stage}`)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(lead.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {filteredLeads.length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-30">
              {t('dashboard.recentLeads.empty')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, description, highlight, blurValue = false, className }: { title: string, value: string, icon: React.ReactNode, description: string, highlight?: 'blue' | 'emerald', blurValue?: boolean, className?: string }) {
  return (
    <Card className={cn(
      "shadow-sm border-slate-200 overflow-hidden relative transition-all hover:shadow-md h-full flex flex-col",
      highlight === 'blue' && "border-l-4 border-l-blue-500",
      highlight === 'emerald' && "border-l-4 border-l-emerald-500",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
        <CardTitle className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{title}</CardTitle>
        <div className="md:p-1.5 bg-slate-50 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className={cn(
          "text-lg md:text-2xl font-black transition-all duration-300", 
          highlight && "text-slate-900",
          blurValue && "blur-md select-none opacity-50"
        )}>
          {value}
        </div>
        <p className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5 font-medium leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}
