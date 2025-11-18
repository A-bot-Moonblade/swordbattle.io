import React from 'react';
import ShopImg from '../assets/img/shop.png'; // Using shop as placeholder
import { AccountState } from '../redux/account/slice';

export default function ClanButton({
  account,
  scale,
  openClan
}: {
  account: AccountState;
  scale: number;
  openClan: () => void;
}) {
  return (
    <div className="clan-btn">
      <img
        src={ShopImg}
        alt="Clans"
        width={250 * scale}
        height={250 * scale}
        onClick={openClan}
      />
    </div>
  );
}
