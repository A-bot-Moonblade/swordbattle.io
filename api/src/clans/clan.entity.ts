import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Account } from 'src/accounts/account.entity';

export const CLAN_COLORS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'violet',
  'white', 'black', 'gray', 'brown', 'maroon', 'pumpkin',
  'cyan', 'pink', 'lime', 'indigo', 'magenta', 'silver', 'gold', 'copper'
] as const;

export type ClanColor = typeof CLAN_COLORS[number];

export interface ClanMember {
  id: number;
  username: string;
  role: 'owner' | 'co-owner' | 'officer' | 'member';
  joinedAt: Date;
  xpEarned: number; // XP earned while in clan
  killsEarned: number; // Kills earned while in clan
  masteryEarned: number; // Mastery earned while in clan
}

export interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'announcement' | 'system';
}

export interface MutedUser {
  userId: number;
  mutedUntil: Date;
}

export interface PendingLeave {
  userId: number;
  leaveAt: Date;
}

export interface AllyRequest {
  id: string;
  fromClanId: number;
  fromClanName: string;
  fromClanTag: string;
  timestamp: Date;
}

@Entity({ name: 'clans' })
export class Clan {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() created_at: Date;

  @Column({ unique: true, length: 25 }) name: string;

  @Column({ unique: true, length: 5 }) tag: string;

  @Column({ length: 100, default: '' }) description: string;

  @Column() ownerId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'ownerId' })
  owner: Account;

  @Column({ default: true }) isPublic: boolean;

  @Column({ default: false }) autoJoin: boolean;

  @Column({ type: 'jsonb', default: '[]' }) inviteCodes: string[];

  @Column({ default: 'gold' }) mainColor: ClanColor;

  @Column({ default: 'gray' }) accentColor: ClanColor;

  // Member management
  @Column({ type: 'jsonb', default: '[]' }) coOwnerIds: number[];

  @Column({ type: 'jsonb', default: '[]' }) officerIds: number[];

  @Column({ type: 'jsonb', default: '[]' }) bannedUserIds: number[];

  @Column({ type: 'jsonb', default: '[]' }) mutedUsers: MutedUser[];

  @Column({ type: 'jsonb', default: '[]' }) pendingLeaves: PendingLeave[];

  // Stats
  @Column({ default: 0 }) clanGems: number;

  @Column({ default: 0 }) totalKills: number;

  @Column({ default: 0 }) totalXP: number;

  @Column({ default: 0 }) totalMastery: number;

  @Column({ default: 0 }) memberCount: number;

  // Diplomacy
  @Column({ type: 'jsonb', default: '[]' }) allyIds: number[];

  @Column({ type: 'jsonb', default: '[]' }) enemyIds: number[];

  @Column({ type: 'jsonb', default: '[]' }) pendingAllyRequests: AllyRequest[];

  // Chat
  @Column({ type: 'jsonb', default: '[]' }) chatMessages: ChatMessage[];

  @Column({ type: 'jsonb', default: '[]' }) announcements: ChatMessage[];

  constructor(data: Partial<Clan> = {}) {
    Object.assign(this, data);
  }

  // Helper methods
  isOwner(userId: number): boolean {
    return this.ownerId === userId;
  }

  isCoOwner(userId: number): boolean {
    return this.coOwnerIds.includes(userId);
  }

  isOfficer(userId: number): boolean {
    return this.officerIds.includes(userId);
  }

  isMember(userId: number): boolean {
    return this.isOwner(userId) || this.isCoOwner(userId) || this.isOfficer(userId);
  }

  isBanned(userId: number): boolean {
    return this.bannedUserIds.includes(userId);
  }

  isMuted(userId: number): boolean {
    const mutedUser = this.mutedUsers.find(m => m.userId === userId);
    if (!mutedUser) return false;
    return new Date(mutedUser.mutedUntil) > new Date();
  }

  hasPermission(userId: number, action: string): boolean {
    if (this.isOwner(userId)) return true;

    const coOwnerPermissions = [
      'createInviteCode', 'muteUser', 'kickUser', 'banUser', 'unbanUser',
      'accessAdminChat', 'viewBanList'
    ];

    const officerPermissions = ['muteUser', 'accessAdminChat'];

    if (this.isCoOwner(userId)) {
      return coOwnerPermissions.includes(action);
    }

    if (this.isOfficer(userId)) {
      return officerPermissions.includes(action);
    }

    return false;
  }
}
