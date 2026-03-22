import { useState } from 'react';
import { UserPlus, MoreHorizontal, Shield, ChevronLeft, ArrowRight, Plus, Users } from 'lucide-react';

/* ══════════════════════════════════════════════════
   Types & Data
   ══════════════════════════════════════════════════ */

interface Member {
  id: string;
  name: string;
  initials: string;
  role: 'admin' | 'member';
  isYou?: boolean;
  sharingFull: boolean;
  avatarColor: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActive: string;
  accentColor: string;
  avatars: { initials: string; color: string }[];
  isFeatured?: boolean;
}

const groups: Group[] = [
  {
    id: 'uni-friends',
    name: 'Uni Friends',
    memberCount: 8,
    lastActive: '2m ago',
    accentColor: '#d4775c',
    avatars: [
      { initials: 'SP', color: '#b87ba8' },
      { initials: 'EW', color: '#d4a843' },
      { initials: 'LC', color: '#7a9ec4' },
    ],
    isFeatured: true,
  },
  {
    id: 'gym-buddies',
    name: 'Gym Buddies',
    memberCount: 5,
    lastActive: '1h ago',
    accentColor: '#7db07e',
    avatars: [
      { initials: 'MR', color: '#6bbab4' },
      { initials: 'TJ', color: '#d4a843' },
      { initials: 'RK', color: '#7a9ec4' },
    ],
  },
  {
    id: 'work-team',
    name: 'Work Team',
    memberCount: 12,
    lastActive: '15m ago',
    accentColor: '#7a9ec4',
    avatars: [
      { initials: 'AH', color: '#d4775c' },
      { initials: 'BL', color: '#b87ba8' },
      { initials: 'CW', color: '#7db07e' },
    ],
  },
];

const members: Member[] = [
  { id: '1', name: 'Jordan Davis', initials: 'JD', role: 'admin', isYou: true, sharingFull: true, avatarColor: '#6bbab4' },
  { id: '2', name: 'Sam Peterson', initials: 'SP', role: 'admin', sharingFull: true, avatarColor: '#b87ba8' },
  { id: '3', name: 'Emma Wilson', initials: 'EW', role: 'member', sharingFull: true, avatarColor: '#d4a843' },
  { id: '4', name: 'Liam Chen', initials: 'LC', role: 'member', sharingFull: false, avatarColor: '#7a9ec4' },
  { id: '5', name: 'Olivia Hart', initials: 'OH', role: 'member', sharingFull: true, avatarColor: '#d4775c' },
  { id: '6', name: 'Noah Kim', initials: 'NK', role: 'member', sharingFull: false, avatarColor: '#7db07e' },
  { id: '7', name: 'Ava Torres', initials: 'AT', role: 'member', sharingFull: true, avatarColor: '#b87ba8' },
  { id: '8', name: 'Mia Brooks', initials: 'MB', role: 'member', sharingFull: true, avatarColor: '#d4a843' },
];

/* ══════════════════════════════════════════════════
   Avatar Pile
   ══════════════════════════════════════════════════ */

function AvatarPile({ avatars, size = 'lg' }: { avatars: { initials: string; color: string }[]; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'lg' ? 'text-[12px]' : 'text-[10px]';
  const overlap = size === 'lg' ? '-space-x-3' : '-space-x-2.5';

  return (
    <div className={`flex ${overlap}`}>
      {avatars.map((av, i) => (
        <div
          key={i}
          className={`${dim} rounded-full flex items-center justify-center ${textSize} font-semibold text-white/90 border-2 border-surface ring-1 ring-white/[0.06]`}
          style={{
            backgroundColor: av.color,
            zIndex: avatars.length - i,
          }}
        >
          {av.initials}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Group Card
   ══════════════════════════════════════════════════ */

function GroupCard({
  group,
  index,
  onClick,
}: {
  group: Group;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group animate-fade-in overflow-hidden bg-white/[0.03] border border-white/[0.07] hover:border-accent/50 hover:bg-white/[0.05]"
      style={{
        animationDelay: `${100 + index * 80}ms`,
        boxShadow: '0 4px 24px -8px rgba(0,0,0,0.3)',
        minHeight: '220px',
      }}
    >
      {/* Hover glow — hidden by default, revealed on hover */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(212,119,92,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <AvatarPile avatars={group.avatars} />
        <h3 className="font-display text-[22px] font-semibold text-text-primary tracking-[-0.01em] mt-5 leading-tight">
          {group.name}
        </h3>
        <p className="text-[13px] text-text-secondary mt-1.5 font-light">
          {group.memberCount} Members
          <span className="text-text-muted mx-1.5">&bull;</span>
          <span className="text-text-muted">Last active {group.lastActive}</span>
        </p>
      </div>

      {/* Bottom action hint */}
      <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
          <span className="text-[11px] text-text-muted font-light tracking-wide uppercase">
            {group.memberCount} active
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium transition-all duration-300 text-text-muted group-hover:text-accent group-hover:gap-2.5">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════
   Create New Circle Card
   ══════════════════════════════════════════════════ */

function CreateNewCard({ index }: { index: number }) {
  return (
    <button
      className="relative rounded-2xl border-[1.5px] border-dashed border-white/[0.08] hover:border-white/[0.16] flex flex-col items-center justify-center gap-4 transition-all duration-300 group animate-fade-in hover:bg-white/[0.02]"
      style={{
        animationDelay: `${100 + index * 80}ms`,
        minHeight: '220px',
      }}
    >
      <div className="w-14 h-14 rounded-2xl border border-white/[0.08] group-hover:border-white/[0.14] flex items-center justify-center transition-all duration-300 group-hover:bg-white/[0.04]">
        <Plus className="w-6 h-6 text-text-muted group-hover:text-text-secondary transition-colors duration-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-medium text-text-muted group-hover:text-text-secondary transition-colors duration-300">
          Create New Circle
        </p>
        <p className="text-[11px] text-text-muted/60 mt-1 font-light">
          Invite friends & share calendars
        </p>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════
   Detail View (Member List) — preserved from original
   ══════════════════════════════════════════════════ */

function GroupDetailView({
  group,
  onBack,
}: {
  group: Group;
  onBack: () => void;
}) {
  const [shareEventTitles, setShareEventTitles] = useState(true);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-display text-[28px] font-semibold text-text-primary tracking-tight leading-none">
              {group.name}
            </h1>
            <p className="text-[13px] text-text-secondary mt-1.5 font-light tracking-wide">
              {group.memberCount} Members <span className="text-text-muted mx-1.5">&bull;</span> Created by You
            </p>
          </div>
        </div>

        <button
          className="h-10 bg-accent hover:bg-accent-hover text-white font-medium px-5 rounded-full flex items-center gap-2 text-[13px] transition-all duration-200"
          style={{
            boxShadow: '0 4px 20px -4px rgba(212,119,92,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <UserPlus className="w-4 h-4" strokeWidth={1.8} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-auto px-8 pb-6 scrollbar-hide">
        <div className="bg-elevated/40 rounded-2xl border border-border-subtle overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
          {members.map((member, i) => (
            <div
              key={member.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 hover:bg-white/[0.02] transition-all duration-200 group animate-fade-in"
              style={{ animationDelay: `${150 + i * 50}ms` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/90 flex-shrink-0 ring-1 ring-white/[0.08]"
                style={{ backgroundColor: member.avatarColor }}
              >
                {member.initials}
              </div>

              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-[14px] font-medium text-text-primary truncate">
                  {member.name}
                </span>
                {member.isYou && (
                  <span className="text-[10px] text-text-muted font-medium tracking-wide">You</span>
                )}
                {member.role === 'admin' && (
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-ev-gold-bg text-ev-gold border border-ev-gold/20">
                    Admin
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 mr-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: member.sharingFull ? '#7db07e' : '#d4a843',
                      boxShadow: member.sharingFull
                        ? '0 0 6px rgba(125,176,126,0.4)'
                        : '0 0 6px rgba(212,168,67,0.4)',
                    }}
                  />
                  <span className="text-[11px] text-text-muted font-light whitespace-nowrap">
                    {member.sharingFull ? 'Full Calendar' : 'Busy/Free Only'}
                  </span>
                </div>
              </div>

              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted/40 hover:text-text-secondary hover:bg-elevated opacity-0 group-hover:opacity-100 transition-all duration-200">
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>

        {/* Privacy Control Card */}
        <div
          className="mt-5 rounded-2xl border border-border-medium bg-elevated/30 p-5 animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary">
                  Your Privacy in this Group
                </h3>
                <p className="text-[12px] text-text-muted mt-0.5 font-light">
                  {shareEventTitles
                    ? 'Friends can see your event titles'
                    : 'Friends only see you as Busy'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[12px] text-text-secondary font-medium">
                Share Event Titles
              </span>
              <button
                onClick={() => setShareEventTitles(!shareEventTitles)}
                className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{
                  backgroundColor: shareEventTitles ? '#d4775c' : '#252320',
                  boxShadow: shareEventTitles
                    ? '0 0 12px rgba(212,119,92,0.3), inset 0 1px 2px rgba(0,0,0,0.1)'
                    : 'inset 0 1px 3px rgba(0,0,0,0.3)',
                  border: shareEventTitles
                    ? '1px solid rgba(224,138,111,0.3)'
                    : '1px solid rgba(255,245,230,0.10)',
                }}
              >
                <div
                  className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-300"
                  style={{
                    left: shareEventTitles ? 'calc(100% - 22px)' : '2px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Main GroupView — Grid Dashboard + Detail Router
   ══════════════════════════════════════════════════ */

export function GroupView() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-2 animate-fade-in">
        <h1 className="font-display text-[32px] font-semibold text-text-primary tracking-[-0.02em] leading-none">
          Your Circles
        </h1>
        <p className="text-[13px] text-text-secondary mt-2 font-light tracking-wide">
          {groups.length} groups <span className="text-text-muted mx-1.5">&bull;</span> {groups.reduce((sum, g) => sum + g.memberCount, 0)} friends connected
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-8 py-6 scrollbar-hide">
        <div className="grid grid-cols-2 gap-4 max-w-[840px]">
          {groups.map((group, i) => (
            <GroupCard
              key={group.id}
              group={group}
              index={i}
              onClick={() => setSelectedGroup(group)}
            />
          ))}
          <CreateNewCard index={groups.length} />
        </div>
      </div>
    </div>
  );
}
