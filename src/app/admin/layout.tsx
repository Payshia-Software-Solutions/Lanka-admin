

'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  MapPin,
  Package as PackageIcon, // Renamed to avoid conflict with Package type
  Percent,
  FileText,
  MessageSquare,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Sun,
  Moon,
  Newspaper,
  Footprints,
  Plane,
  Receipt,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { href: '/admin/tripplans', label: 'Trip Plans', icon: Plane },
  { href: '/admin/activities', label: 'Activities', icon: Footprints },
  { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/costing', label: 'Costing', icon: Receipt },
];

interface UserProfile {
    name: string;
    email: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: "Admin User", email: "admin@example.com" });

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.name && parsedUser.email) {
                setUserProfile(parsedUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        }
    }
  }, [pathname]); // Re-check on route change if needed

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/admin/login');
  };

  // Do not render layout for login or signup pages
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return <>{children}</>;
  }


  return (
    <SidebarProvider defaultOpen>
      <Sidebar 
        collapsible="icon"
        className="border-r border-border/50 shadow-sm"
      >
        <SidebarHeader className="p-4 flex items-center gap-2 justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            {/* Placeholder for logo, replace with actual logo if available */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <h1 className="text-xl font-semibold text-primary">Lanka Admin</h1>
          </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  className="text-sm"
                  tooltip={item.label}
                  isActive={pathname.startsWith(item.href)}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="Admin User" data-ai-hint="user avatar" />
                  <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
              {/* Breadcrumbs or page title can go here */}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </header>
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
