"use client"

import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  CreditCard,
  Star,
  MessageCircle,
  Crown,
  Settings,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"

function NavItem({ icon: Icon, children, href, active }) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          : "hover:bg-muted",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  )
}

function Sidebar({ open, setOpen }) {
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Service Management",
      href: "/services",
      icon: ShoppingBag,
    },
    {
      title: "Order Management",
      href: "/orders",
      icon: ClipboardList,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: CreditCard,
    },
    {
      title: "Ratings & Feedback",
      href: "/ratings",
      icon: Star,
    },

    {
      title: "Subscriptions",
      href: "/subscriptions",
      icon: Crown,
    },
 
  ]

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/80 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1">
              <ChevronRight className="h-6 w-6 rotate-[315deg] text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">GovGenie</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            <div className="mb-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Agent Portal
              </h4>
              <nav className="mt-2 flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    active={pathname === item.href}
                  >
                    {item.title}
                  </NavItem>
                ))}
              </nav>
            </div>



            <div className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-full bg-primary/20 p-1.5 text-primary">
                  <Crown className="h-4 w-4" />
                </div>
                <span className="font-medium">Premium Features</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Upgrade to premium for priority listing and more features
              </p>
              <p className="mb-3 text-sm text-muted-foreground">
                Coming Soon..
              </p>
              <Button size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

export default Sidebar

