
"use client"

import * as React from 'react';
import { useLeads } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, AreaChart, Area } from 'recharts';
import { STAGES } from '@/lib/types';
import { Users, Target, UserCheck, MessageSquare, TrendingUp, Bot, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

export function Dashboard() {
  const { leads, isSyncing, isLoaded } = useLeads();
  const { t } = useTranslation();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // KPIs
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.stage !== 'new').length;
  const botActiveLeads = leads.filter(l => l.botActive !== false).length;
  const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.stage === 'converted').length / totalLeads) * 100).toFixed(1) : 0;

  // Data for Funnel/Bar Chart
  const stageData = STAGES.map(stage => ({
    name: t(`stages.${stage.id}`),
    count: leads.filter(l => l.stage === stage.id).length,
    color: stage.id === 'new' ? '#3b82f6' : 
           stage.id === 'contacted' ? '#f59e0b' : 
           stage.id === 'qualified' ? '#10b981' : '#6366f1'
  }));

  // Data for Trend Chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const trendData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString([], { day: 'numeric', month: 'short' }),
    leads: leads.filter(l => l.createdAt?.split('T')[0] === date).length
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        {isSyncing && (
           <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
             <div className="w-2 h-2 rounded-full bg-primary" />
             Sincronizando datos...
           </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KpiCard 
          title={t('dashboard.kpi.totalLeads')} 
          value={totalLeads.toString()} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          description={t('dashboard.kpi.descTotal')}
        />
        <KpiCard 
          title={t('dashboard.kpi.botActive')} 
          value={botActiveLeads.toString()} 
          icon={<Bot className="h-5 w-5 text-purple-500" />} 
          description={t('dashboard.kpi.descBotActive')}
        />
        <KpiCard 
          title={t('dashboard.kpi.responded')} 
          value={contactedLeads.toString()} 
          icon={<Send className="h-5 w-5 text-pink-500" />} 
          description={t('dashboard.kpi.descResponded')}
        />
        <KpiCard 
          title={t('dashboard.kpi.contacted')} 
          value={contactedLeads.toString()} 
          icon={<MessageSquare className="h-5 w-5 text-amber-500" />} 
          description={t('dashboard.kpi.descContacted')}
        />
        <KpiCard 
          title={t('dashboard.kpi.qualified')} 
          value={leads.filter(l => l.stage === 'qualified').length.toString()} 
          icon={<Target className="h-5 w-5 text-emerald-500" />} 
          description={t('dashboard.kpi.descQualified')}
        />
        <KpiCard 
          title={t('dashboard.kpi.conversionRate')} 
          value={`${conversionRate}%`} 
          icon={<UserCheck className="h-5 w-5 text-indigo-500" />} 
          description={t('dashboard.kpi.descConversion')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.charts.funnel')}</CardTitle>
            <CardDescription>{t('dashboard.charts.funnelDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('dashboard.charts.activity')}</CardTitle>
                <CardDescription>{t('dashboard.charts.activityDesc')}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
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
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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

      {/* Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.charts.health')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
          <div className="px-6 pb-6 grid grid-cols-2 gap-2">
            {stageData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-medium text-slate-500 uppercase">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity Table Preview */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.recentLeads.title')}</CardTitle>
            <CardDescription>{t('dashboard.recentLeads.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {lead.contactName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{lead.contactName}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      lead.stage === 'new' ? "bg-blue-100 text-blue-700" :
                      lead.stage === 'contacted' ? "bg-amber-100 text-amber-700" :
                      lead.stage === 'qualified' ? "bg-emerald-100 text-emerald-700" :
                      "bg-indigo-100 text-indigo-700"
                    )}>
                      {t(`stages.${lead.stage}`)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="py-10 text-center text-muted-foreground">
                  {t('dashboard.recentLeads.empty')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {React.cloneElement(icon as React.ReactElement, { className: "h-12 w-12" })}
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
