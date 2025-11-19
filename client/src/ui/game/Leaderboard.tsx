import { useEffect, useState } from 'react';
import { useScale } from '../Scale';
import './Leaderboard.scss';
import api from '../../api';

// Clan color cache for leaderboard
const clanColorCache: Map<string, string> = new Map();

async function fetchClanColorForLeaderboard(clanTag: string): Promise<string> {
  if (clanColorCache.has(clanTag)) {
    return clanColorCache.get(clanTag)!;
  }

  try {
    const response = await fetch(`${api.endpoint}/clans/tag/${clanTag}`);
    const clan = await response.json();

    if (clan && clan.mainColor) {
      const colorMap: { [key: string]: string } = {
        red: '#ff0000',
        orange: '#ff8800',
        yellow: '#ffff00',
        green: '#00ff00',
        blue: '#0088ff',
        violet: '#8800ff',
        white: '#ffffff',
        black: '#444444', // Slightly lighter black for visibility
        gray: '#888888',
        brown: '#8b4513',
        maroon: '#800000',
        pumpkin: '#ff4500',
        cyan: '#00ffff',
        pink: '#ff69b4',
        lime: '#00ff00',
        indigo: '#4b0082',
        magenta: '#ff00ff',
        silver: '#c0c0c0',
        gold: '#ffd700',
        copper: '#b87333'
      };
      const color = colorMap[clan.mainColor] || '#ffd700';
      clanColorCache.set(clanTag, color);
      return color;
    }
  } catch (error) {
    // If clan fetch fails, use default gold color
  }

  const defaultColor = '#ffd700';
  clanColorCache.set(clanTag, defaultColor);
  return defaultColor;
}

function Leaderboard({ game }: any) {
  const [show, setShow] = useState(true);
  const [players, setPlayers] = useState<any>([]);
  const [selfPlayer, setSelfPlayer] = useState<any>(null);

  const processPlayers = (players: any[], selfId: number) => {
    const sortedPlayers = players.sort((a, b) => b.coins - a.coins);
    sortedPlayers.forEach((player, i) => player.place = i + 1);
    const selfPlayer = sortedPlayers.find(player => player.id === selfId);
    sortedPlayers.splice(10, sortedPlayers.length - 10);

    setSelfPlayer(sortedPlayers.includes(selfPlayer) ? null : selfPlayer);
    return sortedPlayers;
  };

  useEffect(() => {
    if (game) {
      game.events.on('playersUpdate', (players: any, selfId: number) => {
        setPlayers(processPlayers(players, selfId));
      });
    }
  }, [game]);

  const toggleVisibility = () => setShow(!show);

  return (
    <div className="leaderboard" style={useScale(false).styles}>
      <div className="leaderboard-title" role="button" onClick={toggleVisibility}>
        Leaderboard
      </div>

      <div className={`leaderboard-content ${show ? '' : 'hidden'}`}>
        {players.map((player: any) => <LeaderboardLine key={player.id} player={player} />)}
        {selfPlayer && (<div>...</div>)}
        {selfPlayer && <LeaderboardLine player={selfPlayer} />}
      </div>
    </div>
  );
}

function getRankColor(rank: number) {
  // #1 gold, #2 silver, #3 bronze, #4-10 green, #11-50 purple, #51-100 gray
  if (rank === 1) return '#ffff00';
  if (rank === 2) return '#ccccdc';
  if (rank === 3) return '#222222';
  if (rank >= 4 && rank <= 5) return '#00ffff';
  if (rank >= 6 && rank <= 10) return '#00ff00';
  if (rank >= 11 && rank <= 25) return '#ff0000';
  if (rank >= 26 && rank <= 50) return '#ee00ff';
  if (rank >= 51 && rank <= 75) return '#800080';
  if (rank >= 76 && rank <= 100) return '#707070';
  if (rank >= 101 && rank <= 200) return '#575454ff';
  return 'white';
}

function LeaderboardLine({ player }: any) {
  const balance = player.coins >= 1000 ? `${(player.coins / 1000).toFixed(1)}k` : player.coins;
  const [clanColor, setClanColor] = useState('#ffd700'); // Default gold

  const specialColors: {
    [key: string]: string | { gradient: [string, string] };
  } = {
    codergautam: '#ff0000',
    angel: '#acfffc',
    "cool guy 53": '#0099ff',
    "update testing account": '#00ff00',
    amethystbladeyt: '#7802ab',
  };

  // Fetch clan color when component mounts or clan changes
  useEffect(() => {
    if (player.account?.clan && player.account?.clan !== "X79Q") {
      fetchClanColorForLeaderboard(player.account.clan).then(color => {
        setClanColor(color);
      });
    }
  }, [player.account?.clan]);

  let nameStyle: React.CSSProperties = {};
  if (player.account) {
    const special = specialColors[player.name.toLowerCase() as any];
    if (special && typeof special === 'string') {
      nameStyle.color = special;
    } else {
      nameStyle.color = '#3333ff';
    }
  }

  return (
    <div className="leaderboard-line">
      <span className="leaderboard-place">#{player.place}: </span>
      {player.account?.clan && player.account?.clan !== "X79Q" && (
        <span className="leaderboard-clan" style={{ color: clanColor }}>
          [{player.account.clan}]{' '}
        </span>
      )}
      <span className="leaderboard-name" style={nameStyle}>
        {player.name}
        {player.account?.rank && (
          <span style={{ color: getRankColor(player.account.rank) }}>
            {' '}
            (#{player.account.rank})
          </span>
        )}
        <span style={{ color: 'white' }}>- </span>
      </span>
      <span className="leaderboard-score">{balance}</span>
    </div>
  );
}

export default Leaderboard;
