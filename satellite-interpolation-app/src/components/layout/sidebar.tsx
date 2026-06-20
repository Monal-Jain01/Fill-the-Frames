'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload,
  Database,
  Eye,
  Layers,
  SplitSquareHorizontal,
  Activity,
  Film,
  Download,
  Settings,
  Info
} from 'lucide-react';

const sidebarItems = [
  { name: 'Upload', href: '/dashboard/upload', icon: Upload },
  { name: 'Metadata', href: '/dashboard/metadata', icon: Database },
  { name: 'Visualization', href: '/dashboard/visualization', icon: Eye },
  { name: 'Interpolation', href: '/dashboard/interpolation', icon: Layers },
  { name: 'Comparison', href: '/dashboard/comparison', icon: SplitSquareHorizontal },
  { name: 'Metrics', href: '/dashboard/metrics', icon: Activity },
  { name: 'Animation', href: '/dashboard/animation', icon: Film },
  { name: 'Export', href: '/dashboard/export', icon: Download },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'About', href: '/dashboard/about', icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:block overflow-y-auto">
      <nav className="flex flex-col gap-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
