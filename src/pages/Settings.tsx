import { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Lock,
  Users,
  Globe,
  Calendar,
  Shield,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { CustomCalendar } from '../components/CustomCalendar';
import { useNavigate } from 'react-router-dom';

// TYPES
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

type ButtonSetting = SettingItemBase & {
  type: 'button';
  action: () => void;
  variant?: 'danger' | 'primary';
};

type SettingItem =
  | ToggleSetting
  | SelectSetting
  | InfoSetting
  | LinkSetting
  | ButtonSetting;

type SettingsSection = {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
};

export function Settings() {
  const { isDarkMode, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [calendarVisibility, setCalendarVisibility] =
    useState('Friends Only');
  const [defaultView, setDefaultView] = useState('Week');
  const [weekStartDay, setWeekStartDay] = useState('Monday');

  // THEME
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setTheme(!isDarkMode);
  };

  // SETTINGS CONFIG
  const settingsSections: SettingsSection[] = [
    {
      title: 'Preferences',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: isDarkMode ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          ),
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
    {
      title: 'Account',
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: 'Log Out',
          description: 'Sign out of your account',
          icon: <Lock className="w-4 h-4" />,
          type: 'button',
          variant: 'danger',
          action: () => {
            if (window.confirm('Are you sure you want to log out?')) {
              logout();
              localStorage.removeItem('token');
              navigate('/login');
            }
          },
        },
      ],
    },
  ];

  // RENDER ITEM
  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <button
            onClick={() => item.onChange(!item.value)}
            className={`relative w-11 h-6 rounded-full ${
              item.value ? 'bg-accent' : 'bg-white/[0.08]'
            }`}
          >
            <div
              className={`absolute top-[2px] w-5 h-5 rounded-full bg-white ${
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
            className="bg-white/[0.04] border border-border-subtle rounded-lg px-3 py-1.5 text-sm"
          >
            {item.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'info':
        return <div className="text-sm">{item.value}</div>;

      case 'link':
        return (
          <button onClick={item.action}>
            <ChevronRight className="w-4 h-4" />
          </button>
        );

      default:
        return null;
    }
  };

  const renderItemRow = (item: SettingItem) => {
    if (item.type === 'button') {
      return (
        <div key={item.label} className="px-6 py-4">
          <button
            onClick={item.action}
            className={`w-full py-3 rounded-xl font-semibold ${
              item.variant === 'danger'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-accent text-white'
            }`}
          >
            {item.label}
          </button>
        </div>
      );
    }

    return (
      <div
        key={item.label}
        className="px-6 py-4 flex justify-between items-center"
      >
        <div className="flex gap-4 items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            {item.icon}
          </div>
          <div>
            <h3>{item.label}</h3>
            <p className="text-xs opacity-60">{item.description}</p>
          </div>
        </div>

        {renderSettingItem(item)}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="border rounded-xl">
            <div className="p-4 flex gap-2 items-center">
              {section.icon}
              <h2>{section.title}</h2>
            </div>

            <div>{section.items.map(renderItemRow)}</div>
          </div>
        ))}

        <CustomCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          highlightedDates={[
            new Date(new Date().setDate(new Date().getDate() + 2)),
            new Date(new Date().setDate(new Date().getDate() + 5)),
            new Date(new Date().setDate(new Date().getDate() + 8)),
          ]}
        />
      </div>
    </div>
  );
}