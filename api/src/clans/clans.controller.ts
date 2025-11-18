import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ClansService } from './clans.service';
import { AccountGuard } from 'src/auth/guards/account.guard';
import { ClanColor } from './clan.entity';

@Controller('clans')
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  // Get all clans (sorted by members, then kills)
  @Get('all')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 30, ttl: 60000 } })
  async getAllClans(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.clansService.getAllClans(skip || 0, take || 100);
  }

  // Search clans
  @Get('search')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 30, ttl: 60000 } })
  async searchClans(@Query('query') query: string) {
    return this.clansService.searchClans(query);
  }

  // Get clan by ID
  @Get(':id')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 60000 } })
  async getClanById(@Param('id') id: number) {
    return this.clansService.getClanById(id);
  }

  // Get clan by tag
  @Get('tag/:tag')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 60000 } })
  async getClanByTag(@Param('tag') tag: string) {
    return this.clansService.getClanByTag(tag);
  }

  // Get clan members
  @Get(':id/members')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 60000 } })
  async getClanMembers(@Param('id') id: number) {
    return this.clansService.getClanMembers(id);
  }

  // Create clan
  @UseGuards(AccountGuard)
  @Post('create')
  @Throttle({ short: { limit: 1, ttl: 5000 }, medium: { limit: 3, ttl: 60000 } })
  async createClan(
    @Req() request: any,
    @Body() body: { name: string; tag: string; description: string; isPublic: boolean }
  ) {
    const userId = request.account.id;
    const { name, tag, description, isPublic } = body;

    if (!name || !tag) {
      throw new BadRequestException('Name and tag are required');
    }

    return this.clansService.createClan(userId, name, tag, description || '', isPublic);
  }

  // Join clan
  @UseGuards(AccountGuard)
  @Post(':id/join')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async joinClan(
    @Req() request: any,
    @Param('id') clanId: number,
    @Body() body: { inviteCode?: string }
  ) {
    const userId = request.account.id;
    await this.clansService.joinClan(userId, clanId, body.inviteCode);
    return { success: true };
  }

  // Leave clan
  @UseGuards(AccountGuard)
  @Post('leave')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async leaveClan(@Req() request: any) {
    const userId = request.account.id;
    await this.clansService.leaveClan(userId);
    return { success: true };
  }

  // Cancel leave
  @UseGuards(AccountGuard)
  @Post('leave/cancel')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async cancelLeaveClan(@Req() request: any) {
    const userId = request.account.id;
    await this.clansService.cancelLeaveClan(userId);
    return { success: true };
  }

  // Kick member
  @UseGuards(AccountGuard)
  @Post(':id/kick/:userId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async kickMember(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('userId') targetUserId: number
  ) {
    const userId = request.account.id;
    await this.clansService.kickMember(clanId, userId, targetUserId);
    return { success: true };
  }

  // Ban member
  @UseGuards(AccountGuard)
  @Post(':id/ban/:userId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async banMember(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('userId') targetUserId: number
  ) {
    const userId = request.account.id;
    await this.clansService.banMember(clanId, userId, targetUserId);
    return { success: true };
  }

  // Unban member
  @UseGuards(AccountGuard)
  @Post(':id/unban/:userId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async unbanMember(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('userId') targetUserId: number
  ) {
    const userId = request.account.id;
    await this.clansService.unbanMember(clanId, userId, targetUserId);
    return { success: true };
  }

  // Mute member
  @UseGuards(AccountGuard)
  @Post(':id/mute/:userId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async muteMember(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('userId') targetUserId: number,
    @Body() body: { durationMinutes: number }
  ) {
    const userId = request.account.id;
    await this.clansService.muteMember(clanId, userId, targetUserId, body.durationMinutes || 60);
    return { success: true };
  }

  // Set member role
  @UseGuards(AccountGuard)
  @Post(':id/role/:userId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async setMemberRole(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('userId') targetUserId: number,
    @Body() body: { role: 'co-owner' | 'officer' | 'member' }
  ) {
    const userId = request.account.id;
    await this.clansService.setMemberRole(clanId, userId, targetUserId, body.role);
    return { success: true };
  }

  // Generate invite code
  @UseGuards(AccountGuard)
  @Post(':id/invite/generate')
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 20, ttl: 60000 } })
  async generateInviteCode(@Req() request: any, @Param('id') clanId: number) {
    const userId = request.account.id;
    const code = await this.clansService.generateInviteCode(clanId, userId);
    return { code };
  }

  // Update clan settings
  @UseGuards(AccountGuard)
  @Post(':id/settings')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async updateClanSettings(
    @Req() request: any,
    @Param('id') clanId: number,
    @Body() body: {
      name?: string;
      tag?: string;
      description?: string;
      mainColor?: ClanColor;
      accentColor?: ClanColor;
      autoJoin?: boolean;
    }
  ) {
    const userId = request.account.id;
    return this.clansService.updateClanSettings(clanId, userId, body);
  }

  // Donate gems
  @UseGuards(AccountGuard)
  @Post(':id/donate')
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 20, ttl: 60000 } })
  async donateGems(
    @Req() request: any,
    @Param('id') clanId: number,
    @Body() body: { amount: number }
  ) {
    const userId = request.account.id;
    await this.clansService.donateGems(clanId, userId, body.amount);
    return { success: true };
  }

  // Send chat message
  @UseGuards(AccountGuard)
  @Post(':id/chat')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 60000 } })
  async sendChatMessage(
    @Req() request: any,
    @Param('id') clanId: number,
    @Body() body: { message: string; type?: 'chat' | 'announcement' }
  ) {
    const userId = request.account.id;
    await this.clansService.addChatMessage(clanId, userId, body.message, body.type || 'chat');
    return { success: true };
  }

  // Send ally request
  @UseGuards(AccountGuard)
  @Post(':id/ally/request/:targetClanId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async sendAllyRequest(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('targetClanId') targetClanId: number
  ) {
    const userId = request.account.id;
    await this.clansService.sendAllyRequest(clanId, userId, targetClanId);
    return { success: true };
  }

  // Accept ally request
  @UseGuards(AccountGuard)
  @Post(':id/ally/accept/:requestId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async acceptAllyRequest(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('requestId') requestId: string
  ) {
    const userId = request.account.id;
    await this.clansService.acceptAllyRequest(clanId, userId, requestId);
    return { success: true };
  }

  // Declare war
  @UseGuards(AccountGuard)
  @Post(':id/war/declare/:targetClanId')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async declareWar(
    @Req() request: any,
    @Param('id') clanId: number,
    @Param('targetClanId') targetClanId: number
  ) {
    const userId = request.account.id;
    await this.clansService.declareWar(clanId, userId, targetClanId);
    return { success: true };
  }
}
