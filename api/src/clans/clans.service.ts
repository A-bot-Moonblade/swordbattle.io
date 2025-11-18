import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Clan, CLAN_COLORS, ClanColor, ChatMessage, AllyRequest } from './clan.entity';
import { ClanStats } from './clanStats.entity';
import { Account } from 'src/accounts/account.entity';
import { v4 as uuidv4 } from 'uuid';
import * as leoProfanity from 'leo-profanity';

const CLAN_NAME_MAX_LENGTH = 25;
const CLAN_TAG_MAX_LENGTH = 5;
const CLAN_DESCRIPTION_MAX_LENGTH = 100;
const CLAN_CREATION_MASTERY_REQUIREMENT = 50000;
const LEAVE_CLAN_DELAY_HOURS = 3;
const MAX_CHAT_MESSAGES = 100;
const MAX_ANNOUNCEMENTS = 50;

@Injectable()
export class ClansService {
  constructor(
    @InjectRepository(Clan)
    private readonly clansRepository: Repository<Clan>,
    @InjectRepository(ClanStats)
    private readonly clanStatsRepository: Repository<ClanStats>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  // Validation helpers
  private validateClanName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Clan name cannot be empty');
    }
    if (name.length > CLAN_NAME_MAX_LENGTH) {
      throw new BadRequestException(`Clan name cannot exceed ${CLAN_NAME_MAX_LENGTH} characters`);
    }
    if (leoProfanity.check(name)) {
      throw new BadRequestException('Clan name contains inappropriate language');
    }
  }

  private validateClanTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new BadRequestException('Clan tag cannot be empty');
    }
    if (tag.length > CLAN_TAG_MAX_LENGTH) {
      throw new BadRequestException(`Clan tag cannot exceed ${CLAN_TAG_MAX_LENGTH} characters`);
    }
    if (!/^[a-zA-Z0-9]+$/.test(tag)) {
      throw new BadRequestException('Clan tag can only contain letters and numbers');
    }
    if (leoProfanity.check(tag)) {
      throw new BadRequestException('Clan tag contains inappropriate language');
    }
  }

  private validateDescription(description: string): void {
    if (description && description.length > CLAN_DESCRIPTION_MAX_LENGTH) {
      throw new BadRequestException(`Description cannot exceed ${CLAN_DESCRIPTION_MAX_LENGTH} characters`);
    }
    if (description && leoProfanity.check(description)) {
      throw new BadRequestException('Description contains inappropriate language');
    }
  }

  private validateColor(color: string): void {
    if (!CLAN_COLORS.includes(color as ClanColor)) {
      throw new BadRequestException('Invalid clan color');
    }
  }

  // Clan creation
  async createClan(
    ownerId: number,
    name: string,
    tag: string,
    description: string,
    isPublic: boolean,
  ): Promise<Clan> {
    // Validate inputs
    this.validateClanName(name);
    this.validateClanTag(tag);
    this.validateDescription(description);

    // Check if user exists and has enough mastery
    const owner = await this.accountsRepository.findOne({ where: { id: ownerId }, relations: ['total_stats'] });
    if (!owner) {
      throw new NotFoundException('Account not found');
    }

    if (owner.total_stats && owner.total_stats.mastery < CLAN_CREATION_MASTERY_REQUIREMENT) {
      throw new BadRequestException(`You need at least ${CLAN_CREATION_MASTERY_REQUIREMENT} mastery to create a clan`);
    }

    // Check if user is already in a clan
    if (owner.clan && owner.clan.trim() !== '') {
      throw new BadRequestException('You are already in a clan');
    }

    // Check if clan name or tag already exists
    const existingClan = await this.clansRepository.findOne({
      where: [{ name }, { tag: tag.toUpperCase() }],
    });

    if (existingClan) {
      if (existingClan.name === name) {
        throw new BadRequestException('A clan with this name already exists');
      }
      if (existingClan.tag.toUpperCase() === tag.toUpperCase()) {
        throw new BadRequestException('A clan with this tag already exists');
      }
    }

    // Create clan
    const clan = this.clansRepository.create({
      name,
      tag: tag.toUpperCase(),
      description,
      ownerId,
      isPublic,
      autoJoin: false,
      memberCount: 1,
    });

    await this.clansRepository.save(clan);

    // Update owner's clan tag
    owner.clan = clan.tag;
    await this.accountsRepository.save(owner);

    // Create clan stats for owner
    const clanStats = this.clanStatsRepository.create({
      accountId: ownerId,
      clanId: clan.id,
      role: 'owner',
    });
    await this.clanStatsRepository.save(clanStats);

    // Add welcome message
    await this.addSystemMessage(clan.id, `${owner.username} created the clan`);

    return clan;
  }

  // Get clan by ID
  async getClanById(id: number): Promise<Clan> {
    const clan = await this.clansRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!clan) {
      throw new NotFoundException('Clan not found');
    }
    return clan;
  }

  // Get clan by tag
  async getClanByTag(tag: string): Promise<Clan> {
    const clan = await this.clansRepository.findOne({
      where: { tag: tag.toUpperCase() },
      relations: ['owner']
    });
    if (!clan) {
      throw new NotFoundException('Clan not found');
    }
    return clan;
  }

  // Get all clans sorted
  async getAllClans(skip: number = 0, take: number = 100): Promise<Clan[]> {
    // Sort by member count descending, then by total kills descending
    const clans = await this.clansRepository.find({
      order: {
        memberCount: 'DESC',
        totalKills: 'DESC',
      },
      skip,
      take,
    });
    return clans;
  }

  // Search clans by name
  async searchClans(query: string): Promise<Clan[]> {
    if (!query || query.trim().length === 0) {
      return this.getAllClans(0, 20);
    }

    const clans = await this.clansRepository
      .createQueryBuilder('clan')
      .where('LOWER(clan.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(clan.tag) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('clan.memberCount', 'DESC')
      .addOrderBy('clan.totalKills', 'DESC')
      .take(20)
      .getMany();

    return clans;
  }

  // Get clan members with details
  async getClanMembers(clanId: number): Promise<any[]> {
    const clan = await this.getClanById(clanId);

    const clanStats = await this.clanStatsRepository.find({
      where: { clanId, left_at: IsNull() },
      relations: ['account', 'account.total_stats'],
    });

    const members = clanStats.map(stat => ({
      id: stat.account.id,
      username: stat.account.username,
      role: stat.role,
      joinedAt: stat.joined_at,
      xpEarned: stat.xpEarned,
      killsEarned: stat.killsEarned,
      masteryEarned: stat.masteryEarned,
      totalXP: stat.account.total_stats?.xp || 0,
    }));

    // Sort: owner, co-owners, officers, members, each by XP
    const sortedMembers = members.sort((a, b) => {
      const roleOrder = { 'owner': 0, 'co-owner': 1, 'officer': 2, 'member': 3 };
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return roleOrder[a.role] - roleOrder[b.role];
      }
      return b.totalXP - a.totalXP;
    });

    return sortedMembers;
  }

  // Join clan
  async joinClan(userId: number, clanId: number, inviteCode?: string): Promise<void> {
    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.clan && user.clan.trim() !== '') {
      throw new BadRequestException('You are already in a clan');
    }

    const clan = await this.getClanById(clanId);

    // Check if user is banned
    if (clan.isBanned(userId)) {
      throw new ForbiddenException('You are banned from this clan');
    }

    // Handle public vs private clans
    if (!clan.isPublic) {
      // Private clan requires invite code
      if (!inviteCode) {
        throw new BadRequestException('This clan requires an invite code');
      }

      if (!clan.inviteCodes.includes(inviteCode)) {
        throw new BadRequestException('Invalid invite code');
      }

      // Remove the used invite code
      clan.inviteCodes = clan.inviteCodes.filter(code => code !== inviteCode);
    } else {
      // Public clan with autoJoin
      if (!clan.autoJoin) {
        // Would need to send join request to owner/officers (for now, just allow)
        // TODO: Implement join request system
      }
    }

    // Add user to clan
    user.clan = clan.tag;
    await this.accountsRepository.save(user);

    // Create clan stats
    const clanStats = this.clanStatsRepository.create({
      accountId: userId,
      clanId: clan.id,
      role: 'member',
    });
    await this.clanStatsRepository.save(clanStats);

    // Update member count
    clan.memberCount++;
    await this.clansRepository.save(clan);

    // Add welcome message
    await this.addSystemMessage(clan.id, `${user.username} joined the clan`);
  }

  // Leave clan (with delay)
  async leaveClan(userId: number): Promise<void> {
    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.clan || user.clan.trim() === '') {
      throw new BadRequestException('You are not in a clan');
    }

    const clan = await this.getClanByTag(user.clan);

    // Owner cannot leave
    if (clan.ownerId === userId) {
      throw new BadRequestException('Clan owner cannot leave. Transfer ownership or disband the clan instead');
    }

    // Schedule leave
    const leaveAt = new Date(Date.now() + LEAVE_CLAN_DELAY_HOURS * 60 * 60 * 1000);
    clan.pendingLeaves = clan.pendingLeaves.filter(pl => pl.userId !== userId);
    clan.pendingLeaves.push({ userId, leaveAt });
    await this.clansRepository.save(clan);

    await this.addSystemMessage(clan.id, `${user.username} will leave the clan in ${LEAVE_CLAN_DELAY_HOURS} hours`);
  }

  // Cancel pending leave
  async cancelLeaveClan(userId: number): Promise<void> {
    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user || !user.clan) {
      throw new BadRequestException('You are not in a clan');
    }

    const clan = await this.getClanByTag(user.clan);
    clan.pendingLeaves = clan.pendingLeaves.filter(pl => pl.userId !== userId);
    await this.clansRepository.save(clan);

    await this.addSystemMessage(clan.id, `${user.username} cancelled their leave request`);
  }

  // Process pending leaves (should be called periodically)
  async processPendingLeaves(): Promise<void> {
    const clans = await this.clansRepository.find();
    const now = new Date();

    for (const clan of clans) {
      const leavesToProcess = clan.pendingLeaves.filter(pl => new Date(pl.leaveAt) <= now);

      for (const leave of leavesToProcess) {
        await this.removeMemberFromClan(clan.id, leave.userId, true);
      }

      if (leavesToProcess.length > 0) {
        clan.pendingLeaves = clan.pendingLeaves.filter(pl => new Date(pl.leaveAt) > now);
        await this.clansRepository.save(clan);
      }
    }
  }

  // Remove member from clan
  private async removeMemberFromClan(clanId: number, userId: number, isLeave: boolean = false): Promise<void> {
    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const clan = await this.getClanById(clanId);

    // Update user
    user.clan = '';
    await this.accountsRepository.save(user);

    // Update clan stats
    const clanStats = await this.clanStatsRepository.findOne({
      where: { accountId: userId, clanId, left_at: IsNull() },
    });

    if (clanStats) {
      clanStats.left_at = new Date();
      await this.clanStatsRepository.save(clanStats);
    }

    // Remove from roles
    clan.coOwnerIds = clan.coOwnerIds.filter(id => id !== userId);
    clan.officerIds = clan.officerIds.filter(id => id !== userId);

    // Update member count
    clan.memberCount--;
    await this.clansRepository.save(clan);

    const action = isLeave ? 'left' : 'was removed from';
    await this.addSystemMessage(clan.id, `${user.username} ${action} the clan`);
  }

  // Kick member
  async kickMember(clanId: number, ownerId: number, targetUserId: number): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (!clan.hasPermission(ownerId, 'kickUser')) {
      throw new ForbiddenException('You do not have permission to kick members');
    }

    if (targetUserId === clan.ownerId) {
      throw new BadRequestException('Cannot kick the clan owner');
    }

    await this.removeMemberFromClan(clanId, targetUserId, false);
  }

  // Ban member
  async banMember(clanId: number, ownerId: number, targetUserId: number): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (!clan.hasPermission(ownerId, 'banUser')) {
      throw new ForbiddenException('You do not have permission to ban members');
    }

    if (targetUserId === clan.ownerId) {
      throw new BadRequestException('Cannot ban the clan owner');
    }

    // Remove from clan and add to ban list
    await this.removeMemberFromClan(clanId, targetUserId, false);

    if (!clan.bannedUserIds.includes(targetUserId)) {
      clan.bannedUserIds.push(targetUserId);
      await this.clansRepository.save(clan);
    }

    const target = await this.accountsRepository.findOne({ where: { id: targetUserId } });
    if (target) {
      await this.addSystemMessage(clan.id, `${target.username} was banned from the clan`);
    }
  }

  // Unban member
  async unbanMember(clanId: number, ownerId: number, targetUserId: number): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (!clan.hasPermission(ownerId, 'unbanUser')) {
      throw new ForbiddenException('You do not have permission to unban members');
    }

    clan.bannedUserIds = clan.bannedUserIds.filter(id => id !== targetUserId);
    await this.clansRepository.save(clan);
  }

  // Mute member
  async muteMember(clanId: number, ownerId: number, targetUserId: number, durationMinutes: number): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (!clan.hasPermission(ownerId, 'muteUser')) {
      throw new ForbiddenException('You do not have permission to mute members');
    }

    if (targetUserId === clan.ownerId) {
      throw new BadRequestException('Cannot mute the clan owner');
    }

    const mutedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    clan.mutedUsers = clan.mutedUsers.filter(m => m.userId !== targetUserId);
    clan.mutedUsers.push({ userId: targetUserId, mutedUntil });
    await this.clansRepository.save(clan);
  }

  // Set member role
  async setMemberRole(clanId: number, ownerId: number, targetUserId: number, role: 'co-owner' | 'officer' | 'member'): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (clan.ownerId !== ownerId) {
      throw new ForbiddenException('Only the clan owner can change member roles');
    }

    if (targetUserId === clan.ownerId) {
      throw new BadRequestException('Cannot change the owner\'s role');
    }

    // Remove from all role arrays
    clan.coOwnerIds = clan.coOwnerIds.filter(id => id !== targetUserId);
    clan.officerIds = clan.officerIds.filter(id => id !== targetUserId);

    // Add to appropriate role array
    if (role === 'co-owner') {
      clan.coOwnerIds.push(targetUserId);
    } else if (role === 'officer') {
      clan.officerIds.push(targetUserId);
    }

    await this.clansRepository.save(clan);

    // Update clan stats
    const clanStats = await this.clanStatsRepository.findOne({
      where: { accountId: targetUserId, clanId, left_at: IsNull() },
    });

    if (clanStats) {
      clanStats.role = role;
      await this.clanStatsRepository.save(clanStats);
    }
  }

  // Generate invite code
  async generateInviteCode(clanId: number, userId: number): Promise<string> {
    const clan = await this.getClanById(clanId);

    if (!clan.hasPermission(userId, 'createInviteCode')) {
      throw new ForbiddenException('You do not have permission to create invite codes');
    }

    const code = uuidv4();
    clan.inviteCodes.push(code);
    await this.clansRepository.save(clan);

    return code;
  }

  // Update clan settings
  async updateClanSettings(
    clanId: number,
    userId: number,
    updates: Partial<{
      name: string;
      tag: string;
      description: string;
      mainColor: ClanColor;
      accentColor: ClanColor;
      autoJoin: boolean;
    }>,
  ): Promise<Clan> {
    const clan = await this.getClanById(clanId);

    if (clan.ownerId !== userId) {
      throw new ForbiddenException('Only the clan owner can update these settings');
    }

    if (updates.name) {
      this.validateClanName(updates.name);
      const existing = await this.clansRepository.findOne({ where: { name: updates.name } });
      if (existing && existing.id !== clanId) {
        throw new BadRequestException('A clan with this name already exists');
      }
      clan.name = updates.name;
    }

    if (updates.tag) {
      this.validateClanTag(updates.tag);
      const existing = await this.clansRepository.findOne({ where: { tag: updates.tag.toUpperCase() } });
      if (existing && existing.id !== clanId) {
        throw new BadRequestException('A clan with this tag already exists');
      }

      // Update all members' clan tags
      const members = await this.clanStatsRepository.find({
        where: { clanId, left_at: IsNull() },
        relations: ['account'],
      });

      for (const member of members) {
        member.account.clan = updates.tag.toUpperCase();
        await this.accountsRepository.save(member.account);
      }

      clan.tag = updates.tag.toUpperCase();
    }

    if (updates.description !== undefined) {
      this.validateDescription(updates.description);
      clan.description = updates.description;
    }

    if (updates.mainColor) {
      this.validateColor(updates.mainColor);
      clan.mainColor = updates.mainColor;
    }

    if (updates.accentColor) {
      this.validateColor(updates.accentColor);
      clan.accentColor = updates.accentColor;
    }

    if (updates.autoJoin !== undefined) {
      clan.autoJoin = updates.autoJoin;
    }

    await this.clansRepository.save(clan);
    return clan;
  }

  // Donate gems to clan
  async donateGems(clanId: number, userId: number, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.gems < amount) {
      throw new BadRequestException('Insufficient gems');
    }

    const clan = await this.getClanById(clanId);

    // Update user gems
    user.gems -= amount;
    await this.accountsRepository.save(user);

    // Update clan gems
    clan.clanGems += amount;
    await this.clansRepository.save(clan);

    await this.addSystemMessage(clan.id, `${user.username} donated ${amount} gems to the clan treasury`);
  }

  // Add chat message
  async addChatMessage(clanId: number, userId: number, message: string, type: 'chat' | 'announcement' = 'chat'): Promise<void> {
    const clan = await this.getClanById(clanId);
    const user = await this.accountsRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is muted
    if (clan.isMuted(userId) && type === 'chat') {
      throw new ForbiddenException('You are muted');
    }

    // Check permissions for announcements
    if (type === 'announcement' && !clan.hasPermission(userId, 'accessAdminChat')) {
      throw new ForbiddenException('You do not have permission to post announcements');
    }

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      userId,
      username: user.username,
      message: message.substring(0, 500), // Limit message length
      timestamp: new Date(),
      type,
    };

    if (type === 'announcement') {
      clan.announcements.push(chatMessage);
      if (clan.announcements.length > MAX_ANNOUNCEMENTS) {
        clan.announcements = clan.announcements.slice(-MAX_ANNOUNCEMENTS);
      }
    } else {
      clan.chatMessages.push(chatMessage);
      if (clan.chatMessages.length > MAX_CHAT_MESSAGES) {
        clan.chatMessages = clan.chatMessages.slice(-MAX_CHAT_MESSAGES);
      }
    }

    await this.clansRepository.save(clan);
  }

  // Add system message
  private async addSystemMessage(clanId: number, message: string): Promise<void> {
    const clan = await this.getClanById(clanId);

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      userId: 0,
      username: 'System',
      message,
      timestamp: new Date(),
      type: 'system',
    };

    clan.chatMessages.push(chatMessage);
    if (clan.chatMessages.length > MAX_CHAT_MESSAGES) {
      clan.chatMessages = clan.chatMessages.slice(-MAX_CHAT_MESSAGES);
    }

    await this.clansRepository.save(clan);
  }

  // Ally system
  async sendAllyRequest(fromClanId: number, userId: number, toClanId: number): Promise<void> {
    const fromClan = await this.getClanById(fromClanId);
    const toClan = await this.getClanById(toClanId);

    if (fromClan.ownerId !== userId) {
      throw new ForbiddenException('Only the clan owner can send ally requests');
    }

    if (fromClanId === toClanId) {
      throw new BadRequestException('Cannot ally with your own clan');
    }

    // Check if already allies
    if (fromClan.allyIds.includes(toClanId)) {
      throw new BadRequestException('Already allies with this clan');
    }

    // Check if already at war
    if (fromClan.enemyIds.includes(toClanId)) {
      throw new BadRequestException('Cannot ally with a clan you are at war with');
    }

    const request: AllyRequest = {
      id: uuidv4(),
      fromClanId,
      fromClanName: fromClan.name,
      fromClanTag: fromClan.tag,
      timestamp: new Date(),
    };

    toClan.pendingAllyRequests.push(request);
    await this.clansRepository.save(toClan);
  }

  async acceptAllyRequest(clanId: number, userId: number, requestId: string): Promise<void> {
    const clan = await this.getClanById(clanId);

    if (clan.ownerId !== userId) {
      throw new ForbiddenException('Only the clan owner can accept ally requests');
    }

    const request = clan.pendingAllyRequests.find(r => r.id === requestId);
    if (!request) {
      throw new NotFoundException('Ally request not found');
    }

    const otherClan = await this.getClanById(request.fromClanId);

    // Add to ally lists
    clan.allyIds.push(otherClan.id);
    otherClan.allyIds.push(clan.id);

    // Remove request
    clan.pendingAllyRequests = clan.pendingAllyRequests.filter(r => r.id !== requestId);

    await this.clansRepository.save(clan);
    await this.clansRepository.save(otherClan);

    await this.addSystemMessage(clan.id, `${otherClan.name} is now an ally`);
    await this.addSystemMessage(otherClan.id, `${clan.name} is now an ally`);
  }

  async declareWar(fromClanId: number, userId: number, toClanId: number): Promise<void> {
    const fromClan = await this.getClanById(fromClanId);
    const toClan = await this.getClanById(toClanId);

    if (fromClan.ownerId !== userId) {
      throw new ForbiddenException('Only the clan owner can declare war');
    }

    if (fromClanId === toClanId) {
      throw new BadRequestException('Cannot declare war on your own clan');
    }

    // Remove from allies if present
    fromClan.allyIds = fromClan.allyIds.filter(id => id !== toClanId);
    toClan.allyIds = toClan.allyIds.filter(id => id !== fromClanId);

    // Add to enemies
    if (!fromClan.enemyIds.includes(toClanId)) {
      fromClan.enemyIds.push(toClanId);
    }
    if (!toClan.enemyIds.includes(fromClanId)) {
      toClan.enemyIds.push(fromClanId);
    }

    await this.clansRepository.save(fromClan);
    await this.clansRepository.save(toClan);

    await this.addSystemMessage(fromClan.id, `War declared on ${toClan.name}`);
    await this.addSystemMessage(toClan.id, `${fromClan.name} has declared war`);
  }

  // Update clan stats when member earns XP/kills/mastery
  async updateMemberStats(userId: number, xp: number = 0, kills: number = 0, mastery: number = 0, gems: number = 0): Promise<void> {
    const user = await this.accountsRepository.findOne({ where: { id: userId } });
    if (!user || !user.clan) return;

    const clan = await this.getClanByTag(user.clan);
    const clanStats = await this.clanStatsRepository.findOne({
      where: { accountId: userId, clanId: clan.id, left_at: IsNull() },
    });

    if (!clanStats) return;

    // Update member stats
    clanStats.xpEarned += xp;
    clanStats.killsEarned += kills;
    clanStats.masteryEarned += mastery;
    clanStats.gemsEarned += gems;
    await this.clanStatsRepository.save(clanStats);

    // Update clan totals
    clan.totalXP += xp;
    clan.totalKills += kills;
    clan.totalMastery += mastery;
    await this.clansRepository.save(clan);
  }
}
