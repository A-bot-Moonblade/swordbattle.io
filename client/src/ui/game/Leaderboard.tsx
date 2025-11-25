import { useEffect, useState } from 'react';
import { useScale } from '../Scale';
import './Leaderboard.scss';

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
  // #1 gold, #2 silver, #3 black, #4-5 cyan, #6-10 green, #11-25 red, #26-50 pink, #51-75 purple, #76-100 light gray,#101-200 dark gray
  if (rank === 1) return '#ffd900ff';
  if (rank === 2) return '#ccccdc';
  if (rank === 3) return '#222222';
  if (rank >= 4 && rank <= 5) return '#00ffff';
  if (rank >= 6 && rank <= 10) return '#00ff00';
  if (rank >= 11 && rank <= 25) return '#ff0000';
  if (rank >= 26 && rank <= 50) return '#ff00d4ff';
  if (rank >= 51 && rank <= 75) return '#550055ff';
  if (rank >= 76 && rank <= 100) return '#7e7e7eff';
  if (rank >= 101 && rank <= 200) return '#3a3a3aff';
  return 'white';
}

function LeaderboardLine({ player }: any) {
  const balance = player.coins >= 1000 ? `${(player.coins / 1000).toFixed(1)}k` : player.coins;
  const specialColors: {
    [key: string]: string | { gradient: [string, string] };
  } = {
    codergautam: '#ff0000',
    angel: '#acfffc',
    "cool guy 53": '#0099ff',
    "update testing account": '#00ff00',
    amethystbladeyt: '#7802ab',
    "The Cursed Demon": '#700101ff' //temp for live event
  };

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
        <span className="leaderboard-clan" style={{ color: 'yellow' }}>
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
