import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Account } from 'src/accounts/account.entity';
import { Clan } from './clan.entity';

@Entity({ name: 'clan_stats' })
export class ClanStats {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() joined_at: Date;

  @Column({ nullable: true }) left_at: Date;

  @Column() accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column() clanId: number;

  @ManyToOne(() => Clan)
  @JoinColumn({ name: 'clanId' })
  clan: Clan;

  @Column({ default: 0 }) xpEarned: number;

  @Column({ default: 0 }) killsEarned: number;

  @Column({ default: 0 }) masteryEarned: number;

  @Column({ default: 0 }) gemsEarned: number;

  @Column({ type: 'varchar', default: 'member' })
  role: 'owner' | 'co-owner' | 'officer' | 'member';

  constructor(data: Partial<ClanStats> = {}) {
    Object.assign(this, data);
  }
}
