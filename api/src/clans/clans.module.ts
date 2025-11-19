import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClansService } from './clans.service';
import { Clan } from './clan.entity';
import { ClanStats } from './clanStats.entity';
import { ClansController } from './clans.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clan, ClanStats]),
    forwardRef(() => AccountsModule),
    forwardRef(() => StatsModule),
  ],
  providers: [ClansService],
  exports: [ClansService],
  controllers: [ClansController],
})
export class ClansModule {}
