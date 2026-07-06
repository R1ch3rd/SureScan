// Sidebar.tsx
import React from 'react';
import { Home, Brain, MessageSquare, Activity } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'diagnosis', icon: Brain, label: 'Scan' },
    { id: 'survival', icon: Activity, label: 'Survival' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 z-40 h-full bg-surface-warm border-r border-surface-border transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[80px] lg:w-[80px]' : 'w-0 lg:w-[80px] overflow-hidden'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 flex justify-center items-center h-16 border-b border-surface-border">
          <span className="w-9 h-9 bg-accent-btn rounded-lg flex items-center justify-center text-white font-mono text-sm font-semibold">
            SS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8">
          <ul className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="px-3">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-accent-btn text-white'
                        : 'text-ink-muted hover:text-ink hover:bg-cream-deep'
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-[11px] mt-1">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 text-center border-t border-surface-border">
          <a
            href="https://r1ch3rd.github.io/folio/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-ink-faint hover:text-accent-deep transition-colors"
          >
            by RS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
