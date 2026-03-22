import { Home, Calendar, Users, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type View = 'home' | 'calendar' | 'groups' | 'settings';

const navItems: { icon: typeof Home; label: string; view: View }[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Calendar, label: 'My Calendar', view: 'calendar' },
  { icon: Users, label: 'Groups', view: 'groups' },
  { icon: Settings, label: 'Settings', view: 'settings' },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { user } = useAuthStore();
  
  // Get user initials
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="w-[76px] flex flex-col items-center py-7 gap-6 border-r border-border-subtle">
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center animate-fade-in"
        style={{ boxShadow: '0 4px 16px -2px rgba(212,119,92,0.4)' }}>
        <span className="font-display text-lg font-bold text-white tracking-tight">V</span>
      </div>
      <nav className="flex flex-col items-center gap-1 mt-2">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.view === activeView;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group animate-fade-in ${
                isActive ? 'bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-elevated/50'
              }`}
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
              title={item.label}>
              <Icon className="w-[18px] h-[18px] relative z-10" strokeWidth={1.5} />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-[3px] h-5 bg-accent rounded-full"
                  style={{ boxShadow: '0 0 8px rgba(212,119,92,0.5)' }} />
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto w-9 h-9 rounded-full bg-card flex items-center justify-center text-text-secondary text-xs font-medium cursor-pointer hover:text-text-primary hover:bg-elevated transition-all duration-200 border border-border-subtle animate-fade-in"
        style={{ animationDelay: '400ms' }}
        title={user?.name || 'User'}>
        {userInitials}
      </div>
    </aside>
  );
}