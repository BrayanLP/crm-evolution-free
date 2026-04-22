
"use client"

import { Menu, LayoutGrid, PieChart, Users, Briefcase, Info, Settings, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTranslation } from "@/context/LanguageContext"
import { useLeads } from "@/lib/store"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MobileNav() {
  const { t } = useTranslation()
  const { accounts, activeAccount, setActiveAccountId } = useLeads()
  const pathname = usePathname()

  const navItems = [
    { icon: <PieChart className="h-5 w-5" />, label: t('nav.dashboard'), href: "/" },
    { icon: <LayoutGrid className="h-5 w-5" />, label: t('nav.leads'), href: "/leads" },
    { icon: <Users className="h-5 w-5" />, label: t('nav.contacts'), href: "/contacts" },
    { icon: <Briefcase className="h-5 w-5" />, label: t('nav.services'), href: "/services" },
    { icon: <Info className="h-5 w-5" />, label: t('nav.info'), href: "/info" },
    { icon: <Settings className="h-5 w-5" />, label: t('nav.settings'), href: "/settings" },
  ]

  return (
    <div className="md:hidden mr-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:text-primary">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutGrid className="text-white h-5 w-5" />
              </div>
              <SheetTitle className="text-xl font-bold tracking-tight text-primary font-headline">LeadFlow</SheetTitle>
            </div>
            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Cuenta Activa</Label>
                <Select value={activeAccount?.id} onValueChange={setActiveAccountId}>
                  <SelectTrigger className="h-10 bg-slate-50 border-none text-xs font-bold">
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
          </SheetHeader>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center rounded-md",
                  pathname === item.href 
                    ? "bg-primary/5 text-primary shadow-sm" 
                    : "text-slate-500 hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.icon}
                {item.label}
                {pathname === item.href && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <label className={cn("block", className)}>{children}</label>
}
