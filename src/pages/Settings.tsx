import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Lock, Users, Globe, Calendar, Shield, ChevronRight, Clock } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { CustomCalendar } from '../components/CustomCalendar';

// Define types for settings items
type SettingItemBase = {
  label: string;
  description: string;
  icon: React.ReactNode;
};

type ToggleSetting = SettingItemBase & {
  type: 'toggle';
  value: boolean;
  onChange: (value: boolean) => void;
};

type SelectSetting = SettingItemBase & {
  type: 'select';
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type InfoSetting = SettingItemBase & {
  type: 'info';
  value: string;
};

type LinkSetting = SettingItemBase & {
  type: 'link';
  action: () => void;
};

type SettingItem = ToggleSetting | SelectSetting | InfoSetting | LinkSetting;

type SettingsSection = {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
};

export function Settings() {
  const { isDarkMode, toggleTheme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [calendarVisibility, setCalendarVisibility] = useState('Friends Only');
  const [defaultView, setDefaultView] = useState('Week');
  const [weekStartDay, setWeekStartDay] = useState('Monday');

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setTheme(newTheme);
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Preferences',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
          type: 'toggle',
          value: isDarkMode,
          onChange: handleThemeToggle,
        },
        {
          label: 'Time Zone',
          description: user?.time_zone || 'UTC',
          icon: <Clock className="w-4 h-4" />,
          type: 'info',
          value: user?.time_zone || 'UTC',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          label: 'Push Notifications',
          description: 'Get notified about upcoming events',
          icon: <Bell className="w-4 h-4" />,
          type: 'toggle',
          value: notificationsEnabled,
          onChange: setNotificationsEnabled,
        },
        {
          label: 'Email Reminders',
          description: 'Receive event reminders via email',
          icon: <Bell className="w-4 h-4" />,
          type: 'toggle',
          value: emailReminders,
          onChange: setEmailReminders,
        },
      ],
    },
    {
      title: 'Privacy',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          label: 'Calendar Visibility',
          description: 'Control who can see your calendar',
          icon: <Lock className="w-4 h-4" />,
          type: 'select',
          options: ['Public', 'Friends Only', 'Private'],
          value: calendarVisibility,
          onChange: setCalendarVisibility,
        },
        {
          label: 'Blocked Users',
          description: 'Manage blocked users',
          icon: <Users className="w-4 h-4" />,
          type: 'link',
          action: () => console.log('Navigate to blocked users'),
        },
      ],
    },
    {
      title: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        {
          label: 'Default Calendar View',
          description: 'Choose your default calendar view',
          icon: <Calendar className="w-4 h-4" />,
          type: 'select',
          options: ['Month', 'Week', 'Day'],
          value: defaultView,
          onChange: setDefaultView,
        },
        {
          label: 'Week Start Day',
          description: 'Choose which day starts the week',
          icon: <Calendar className="w-4 h-4" />,
          type: 'select',
          options: ['Monday', 'Sunday'],
          value: weekStartDay,
          onChange: setWeekStartDay,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <button
            onClick={() => item.onChange(!item.value)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              item.value ? 'bg-accent' : 'bg-white/[0.08]'
            }`}
          >
            <div
              className={`absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                item.value ? 'right-[2px]' : 'left-[2px]'
              }`}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={item.value}
            onChange={(e) => item.onChange(e.target.value)}
            className="bg-white/[0.04] border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors cursor-pointer"
          >
            {item.options.map((opt) => (
              <option key={opt} value={opt} className="bg-secondary text-text-primary">
                {opt}
              </option>
            ))}
          </select>
        );

      case 'info':
        return (
          <div className="text-sm text-text-secondary">{item.value}</div>
        );

      case 'link':
        return (
          <button
            onClick={item.action}
            className="text-text-muted hover:text-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-text-secondary mt-1">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className="bg-elevated/40 rounded-2xl border border-border-subtle overflow-hidden animate-fade-in"
                style={{ animationDelay: `${sectionIndex * 100}ms` }}
              >
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    {section.icon}
                  </div>
                  <h2 className="font-semibold text-text-primary">{section.title}</h2>
                </div>

                {/* Section Items */}
                <div className="divide-y divide-border-subtle">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item.label}
                      className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-text-muted">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-text-primary">{item.label}</h3>
                          <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
                        </div>
                      </div>

                      <div>
                        {renderSettingItem(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Date Picker Preview */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-elevated/40 rounded-2xl border border-border-subtle p-6 sticky top-8">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Picker Preview
              </h2>
              <p className="text-xs text-text-muted mb-4">
                Select a date to see the custom calendar in action
              </p>
              <CustomCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                highlightedDates={[
                  new Date(new Date().setDate(new Date().getDate() + 2)),
                  new Date(new Date().setDate(new Date().getDate() + 5)),
                  new Date(new Date().setDate(new Date().getDate() + 8)),
                ]}
              />
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="text-xs text-text-muted space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span>Selected date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent/20 border border-accent/50"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent/30"></div>
                    <span>Highlighted dates</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="text-xs text-text-muted">
                  <p className="mb-1">Selected: <span className="text-accent">{selectedDate.toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}