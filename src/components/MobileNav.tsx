
"use client"

import { Menu, LayoutGrid, PieChart, Users, Briefcase, Info, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTranslation } from "@/context/LanguageContext"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const { t } = useTranslation()
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
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 border-b text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutGrid className="text-white h-5 w-5" />
              </div>
              <SheetTitle className="text-xl font-bold tracking-tight text-primary font-headline">LeadFlow</SheetTitle>
            </div>
          </SheetHeader>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full justify-start gap-3 px-4 py-4 text-base font-medium transition-all duration-200 flex items-center rounded-md",
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
