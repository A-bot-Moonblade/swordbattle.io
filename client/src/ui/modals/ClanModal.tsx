import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AccountState, updateAccountAsync } from '../../redux/account/slice';
import api from '../../api';
import './ClanModal.scss';
import { numberWithCommas } from '../../helpers';

interface ClanModalProps {
  account: AccountState;
}

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  ownerId: number;
  owner: { username: string };
  isPublic: boolean;
  autoJoin: boolean;
  mainColor: string;
  accentColor: string;
  clanGems: number;
  totalKills: number;
  totalXP: number;
  totalMastery: number;
  memberCount: number;
  allyIds: number[];
  enemyIds: number[];
  pendingAllyRequests: AllyRequest[];
  chatMessages: ChatMessage[];
  announcements: ChatMessage[];
  coOwnerIds: number[];
  officerIds: number[];
  bannedUserIds: number[];
  mutedUsers: any[];
  pendingLeaves: any[];
  created_at: string;
}

interface ClanMember {
  id: number;
  username: string;
  role: 'owner' | 'co-owner' | 'officer' | 'member';
  joinedAt: string;
  xpEarned: number;
  killsEarned: number;
  masteryEarned: number;
  totalXP: number;
}

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'announcement' | 'system';
}

interface AllyRequest {
  id: string;
  fromClanId: number;
  fromClanName: string;
  fromClanTag: string;
  timestamp: string;
}

const CLAN_COLORS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'violet',
  'white', 'black', 'gray', 'brown', 'maroon', 'pumpkin',
  'cyan', 'pink', 'lime', 'indigo', 'magenta', 'silver', 'gold', 'copper'
];

const ClanModal: React.FC<ClanModalProps> = ({ account }) => {
  const dispatch = useDispatch();

  // Main tab state
  const [mainTab, setMainTab] = useState<'all' | 'your'>('all');
  const [subTab, setSubTab] = useState<'profile' | 'chat' | 'settings' | 'controls'>('profile');

  // Data states
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [selectedClanMembers, setSelectedClanMembers] = useState<ClanMember[]>([]);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [userClanMembers, setUserClanMembers] = useState<ClanMember[]>([]);

  // Allied/enemy clans
  const [alliedClans, setAlliedClans] = useState<Clan[]>([]);
  const [enemyClans, setEnemyClans] = useState<Clan[]>([]);

  // Create clan form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [clanIsPublic, setClanIsPublic] = useState(true);

  // Chat
  const [chatMessage, setChatMessage] = useState('');
  const [chatTab, setChatTab] = useState<'general' | 'announcements' | 'admin'>('general');

  // Settings
  const [editedName, setEditedName] = useState('');
  const [editedTag, setEditedTag] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [mainColor, setMainColor] = useState('gold');
  const [accentColor, setAccentColor] = useState('gray');

  // Treasury
  const [showTreasury, setShowTreasury] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  // Invite code
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inputInviteCode, setInputInviteCode] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userClan?.chatMessages, userClan?.announcements]);

  // Fetch all clans on mount
  useEffect(() => {
    fetchAllClans();

    // If user has a clan, fetch it
    if (account.clan && account.clan.trim() !== '') {
      fetchUserClan();
    }
  }, [account.clan]);

  // Refresh user clan every 5 seconds when viewing
  useEffect(() => {
    if (mainTab === 'your' && account.clan) {
      const interval = setInterval(() => {
        fetchUserClan();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mainTab, account.clan]);

  const fetchAllClans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api.endpoint}/clans/all`);
      const clans = await response.json();
      setAllClans(clans);
    } catch (error) {
      console.error('Failed to fetch clans:', error);
    }
    setLoading(false);
  };

  const fetchUserClan = async () => {
    if (!account.clan || account.clan.trim() === '') return;

    try {
      const response = await fetch(`${api.endpoint}/clans/tag/${account.clan}`);
      const clan = await response.json();
      setUserClan(clan);

      // Fetch members
      const membersResponse = await fetch(`${api.endpoint}/clans/${clan.id}/members`);
      const members = await membersResponse.json();
      setUserClanMembers(members);

      // Fetch allied clans
      if (clan.allyIds && clan.allyIds.length > 0) {
        const allies = await Promise.all(
          clan.allyIds.map((id: number) =>
            fetch(`${api.endpoint}/clans/${id}`).then(r => r.json())
          )
        );
        setAlliedClans(allies);
      }

      // Fetch enemy clans
      if (clan.enemyIds && clan.enemyIds.length > 0) {
        const enemies = await Promise.all(
          clan.enemyIds.map((id: number) =>
            fetch(`${api.endpoint}/clans/${id}`).then(r => r.json())
          )
        );
        setEnemyClans(enemies);
      }
    } catch (error) {
      console.error('Failed to fetch user clan:', error);
    }
  };

  const searchClans = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      fetchAllClans();
      return;
    }

    try {
      const response = await fetch(`${api.endpoint}/clans/search?query=${encodeURIComponent(query)}`);
      const clans = await response.json();
      setAllClans(clans);
    } catch (error) {
      console.error('Failed to search clans:', error);
    }
  };

  const viewClanProfile = async (clan: Clan) => {
    setSelectedClan(clan);

    // Fetch members
    try {
      const response = await fetch(`${api.endpoint}/clans/${clan.id}/members`);
      const members = await response.json();
      setSelectedClanMembers(members);
    } catch (error) {
      console.error('Failed to fetch clan members:', error);
    }
  };

  const createClan = async () => {
    if (!account.isLoggedIn) {
      alert('You must be logged in to create a clan');
      return;
    }

    if (!clanName.trim() || !clanTag.trim()) {
      alert('Clan name and tag are required');
      return;
    }

    setLoading(true);
    api.post(`${api.endpoint}/clans/create`, {
      name: clanName.trim(),
      tag: clanTag.trim().toUpperCase(),
      description: clanDescription.trim(),
      isPublic: clanIsPublic
    }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Clan created successfully!');
        setShowCreateForm(false);
        setClanName('');
        setClanTag('');
        setClanDescription('');
        dispatch(updateAccountAsync() as any);
        fetchAllClans();
      }
      setLoading(false);
    });
  };

  const joinClan = async (clanId: number, needsInviteCode: boolean = false) => {
    if (!account.isLoggedIn) {
      alert('You must be logged in to join a clan');
      return;
    }

    if (needsInviteCode && !inputInviteCode.trim()) {
      setShowInviteInput(true);
      return;
    }

    setLoading(true);
    api.post(`${api.endpoint}/clans/${clanId}/join`, {
      inviteCode: needsInviteCode ? inputInviteCode : undefined
    }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Successfully joined the clan!');
        setShowInviteInput(false);
        setInputInviteCode('');
        dispatch(updateAccountAsync() as any);
      }
      setLoading(false);
    });
  };

  const leaveClan = async () => {
    if (!confirm('Are you sure you want to leave the clan? You will be removed in 3 hours.')) {
      return;
    }

    api.post(`${api.endpoint}/clans/leave`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Leave request submitted. You will be removed in 3 hours. You can cancel before then.');
        fetchUserClan();
      }
    });
  };

  const cancelLeave = async () => {
    api.post(`${api.endpoint}/clans/leave/cancel`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Leave request cancelled!');
        fetchUserClan();
      }
    });
  };

  const donateGems = async () => {
    if (!userClan) return;

    const amount = parseInt(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > account.gems) {
      alert('Insufficient gems');
      return;
    }

    api.post(`${api.endpoint}/clans/${userClan.id}/donate`, { amount }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert(`Successfully donated ${amount} gems!`);
        setDonationAmount('');
        setShowTreasury(false);
        dispatch(updateAccountAsync() as any);
        fetchUserClan();
      }
    });
  };

  const sendChatMessage = async () => {
    if (!userClan || !chatMessage.trim()) return;

    const messageType = chatTab === 'announcements' ? 'announcement' : 'chat';

    api.post(`${api.endpoint}/clans/${userClan.id}/chat`, {
      message: chatMessage,
      type: messageType
    }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        setChatMessage('');
        fetchUserClan();
      }
    });
  };

  const generateInviteCode = async () => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/invite/generate`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        setInviteCode(data.code);
        alert(`Invite code generated: ${data.code}\nThis code can only be used once.`);
      }
    });
  };

  const updateClanSettings = async () => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/settings`, {
      name: editedName || undefined,
      tag: editedTag || undefined,
      description: editedDescription !== undefined ? editedDescription : undefined,
      mainColor,
      accentColor
    }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Settings updated successfully!');
        setEditedName('');
        setEditedTag('');
        setEditedDescription('');
        dispatch(updateAccountAsync() as any);
        fetchUserClan();
      }
    });
  };

  const setMemberRole = async (memberId: number, role: 'co-owner' | 'officer' | 'member') => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/role/${memberId}`, { role }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Role updated!');
        fetchUserClan();
      }
    });
  };

  const kickMember = async (memberId: number) => {
    if (!userClan || !confirm('Are you sure you want to kick this member?')) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/kick/${memberId}`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Member kicked!');
        fetchUserClan();
      }
    });
  };

  const banMember = async (memberId: number) => {
    if (!userClan || !confirm('Are you sure you want to ban this member?')) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/ban/${memberId}`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Member banned!');
        fetchUserClan();
      }
    });
  };

  const muteMember = async (memberId: number, minutes: number) => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/mute/${memberId}`, { durationMinutes: minutes }, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert(`Member muted for ${minutes} minutes!`);
        fetchUserClan();
      }
    });
  };

  const sendAllyRequest = async (targetClanId: number) => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/ally/request/${targetClanId}`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Ally request sent!');
      }
    });
  };

  const acceptAllyRequest = async (requestId: string) => {
    if (!userClan) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/ally/accept/${requestId}`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Ally request accepted!');
        fetchUserClan();
      }
    });
  };

  const declareWar = async (targetClanId: number) => {
    if (!userClan || !confirm('Are you sure you want to declare war on this clan?')) return;

    api.post(`${api.endpoint}/clans/${userClan.id}/war/declare/${targetClanId}`, {}, (data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('War declared!');
        fetchUserClan();
      }
    });
  };

  const isOwner = userClan && account.id === userClan.ownerId;
  const isCoOwner = userClan && userClan.coOwnerIds.includes(account.id);
  const isOfficer = userClan && userClan.officerIds.includes(account.id);
  const hasPendingLeave = userClan && userClan.pendingLeaves.some((pl: any) => pl.userId === account.id);

  const getColorValue = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#ff0000',
      orange: '#ff8800',
      yellow: '#ffff00',
      green: '#00ff00',
      blue: '#0000ff',
      violet: '#8800ff',
      white: '#ffffff',
      black: '#000000',
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
    return colorMap[color] || '#ffd700';
  };

  const getAccentColor = (color: string): string => {
    // Return a darker version of the main color
    const hex = getColorValue(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
  };

  // Render clan profile
  const renderClanProfile = (clan: Clan, members: ClanMember[], isUserClan: boolean = false) => {
    const mainColorValue = getColorValue(clan.mainColor);
    const accentColorValue = getAccentColor(clan.mainColor);

    return (
      <div className="clan-profile" style={{
        background: `linear-gradient(135deg, ${accentColorValue} 0%, ${mainColorValue} 100%)`
      }}>
        <div className="clan-profile-header">
          <div className="clan-profile-title">
            <h2>{clan.name}</h2>
            <h3 style={{ color: mainColorValue }}>[{clan.tag}]</h3>
            <p className="clan-description">{clan.description || 'No description'}</p>
            <p className="clan-owner">Owner: {clan.owner.username}</p>
          </div>

          <div className="clan-profile-actions">
            {isUserClan && isOwner && (
              <button onClick={() => generateInviteCode()} className="clan-btn-primary">
                Generate Invite Code
              </button>
            )}
            {isUserClan && (
              <>
                <button onClick={() => setShowTreasury(true)} className="clan-btn-primary">
                  Treasury
                </button>
                {hasPendingLeave ? (
                  <button onClick={cancelLeave} className="clan-btn-warning">
                    Cancel Leave
                  </button>
                ) : (
                  <button onClick={leaveClan} className="clan-btn-danger">
                    Leave Clan
                  </button>
                )}
              </>
            )}
            {!isUserClan && account.isLoggedIn && (!account.clan || account.clan.trim() === '') && (
              <>
                {showInviteInput ? (
                  <div className="invite-code-input">
                    <input
                      type="text"
                      value={inputInviteCode}
                      onChange={(e) => setInputInviteCode(e.target.value)}
                      placeholder="Enter invite code"
                    />
                    <button onClick={() => joinClan(clan.id, true)} className="clan-btn-primary">
                      Join
                    </button>
                    <button onClick={() => setShowInviteInput(false)} className="clan-btn-secondary">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => clan.isPublic ? joinClan(clan.id) : setShowInviteInput(true)}
                    className="clan-btn-primary"
                  >
                    {clan.isPublic ? 'Join Clan' : 'Join (Code Required)'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="clan-stats">
          <h3>Clan Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Members:</span>
              <span className="stat-value">{clan.memberCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Kills:</span>
              <span className="stat-value">{numberWithCommas(clan.totalKills)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total XP:</span>
              <span className="stat-value">{numberWithCommas(clan.totalXP)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Mastery:</span>
              <span className="stat-value">{numberWithCommas(clan.totalMastery)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Clan Gems:</span>
              <span className="stat-value">{numberWithCommas(clan.clanGems)}</span>
            </div>
          </div>
        </div>

        {isUserClan && (alliedClans.length > 0 || enemyClans.length > 0) && (
          <div className="clan-diplomacy">
            {alliedClans.length > 0 && (
              <div className="allies-section">
                <h4>Allies</h4>
                <div className="clan-list-mini">
                  {alliedClans.map(ally => (
                    <span key={ally.id} className="clan-tag-mini" style={{ color: getColorValue(ally.mainColor) }}>
                      [{ally.tag}] {ally.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {enemyClans.length > 0 && (
              <div className="enemies-section">
                <h4>At War With</h4>
                <div className="clan-list-mini">
                  {enemyClans.map(enemy => (
                    <span key={enemy.id} className="clan-tag-mini enemy" style={{ color: getColorValue(enemy.mainColor) }}>
                      [{enemy.tag}] {enemy.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="clan-members-list">
          <h3>Members</h3>
          {members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <span className="member-name">
                  {member.username}
                  <span className={`member-role role-${member.role}`}>({member.role})</span>
                </span>
                <span className="member-stats">
                  XP Earned: {numberWithCommas(member.xpEarned)} |
                  Kills: {numberWithCommas(member.killsEarned)} |
                  Total XP: {numberWithCommas(member.totalXP)}
                </span>
              </div>

              {isUserClan && isOwner && member.id !== account.id && (
                <div className="member-actions">
                  <select
                    onChange={(e) => setMemberRole(member.id, e.target.value as any)}
                    defaultValue={member.role}
                  >
                    <option value="member">Member</option>
                    <option value="officer">Officer</option>
                    <option value="co-owner">Co-Owner</option>
                  </select>
                  <button onClick={() => muteMember(member.id, 60)} className="clan-btn-small">Mute (1h)</button>
                  <button onClick={() => kickMember(member.id)} className="clan-btn-small clan-btn-warning">Kick</button>
                  <button onClick={() => banMember(member.id)} className="clan-btn-small clan-btn-danger">Ban</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render chat
  const renderChat = () => {
    if (!userClan) return null;

    const messages = chatTab === 'announcements' ? userClan.announcements : userClan.chatMessages;
    const canAnnounce = isOwner || isCoOwner || isOfficer;

    return (
      <div className="clan-chat">
        <div className="chat-tabs">
          <button
            className={chatTab === 'general' ? 'active' : ''}
            onClick={() => setChatTab('general')}
          >
            General Chat
          </button>
          <button
            className={chatTab === 'announcements' ? 'active' : ''}
            onClick={() => setChatTab('announcements')}
          >
            Announcements
          </button>
          {canAnnounce && (
            <button
              className={chatTab === 'admin' ? 'active' : ''}
              onClick={() => setChatTab('admin')}
            >
              Admin Chat
            </button>
          )}
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              <span className="chat-username">{msg.username}:</span>
              <span className="chat-text">{msg.message}</span>
              <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Type a message..."
            maxLength={500}
          />
          <button onClick={sendChatMessage} className="clan-btn-primary">Send</button>
        </div>
      </div>
    );
  };

  // Render settings
  const renderSettings = () => {
    if (!userClan || !isOwner) {
      return <div className="clan-settings">Only the clan owner can access settings.</div>;
    }

    return (
      <div className="clan-settings">
        <h3>Clan Settings</h3>

        <div className="setting-group">
          <label>Clan Name (max 25 chars)</label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder={userClan.name}
            maxLength={25}
          />
        </div>

        <div className="setting-group">
          <label>Clan Tag (max 5 chars)</label>
          <input
            type="text"
            value={editedTag}
            onChange={(e) => setEditedTag(e.target.value.toUpperCase())}
            placeholder={userClan.tag}
            maxLength={5}
          />
        </div>

        <div className="setting-group">
          <label>Description (max 100 chars)</label>
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder={userClan.description}
            maxLength={100}
          />
        </div>

        <div className="setting-group">
          <label>Main Color (tag color)</label>
          <select value={mainColor} onChange={(e) => setMainColor(e.target.value)}>
            {CLAN_COLORS.map(color => (
              <option key={color} value={color} style={{ color: getColorValue(color) }}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label>Accent Color</label>
          <select value={accentColor} onChange={(e) => setAccentColor(e.target.value)}>
            {CLAN_COLORS.map(color => (
              <option key={color} value={color} style={{ color: getColorValue(color) }}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <h4>Ban List</h4>
          {userClan.bannedUserIds.length === 0 ? (
            <p>No banned users</p>
          ) : (
            <ul>
              {userClan.bannedUserIds.map((userId: number) => (
                <li key={userId}>User ID: {userId}</li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={updateClanSettings} className="clan-btn-primary">
          Save Settings
        </button>
      </div>
    );
  };

  // Render controls (owner only)
  const renderControls = () => {
    if (!userClan || !isOwner) {
      return <div className="clan-controls">Only the clan owner can access controls.</div>;
    }

    return (
      <div className="clan-controls">
        <h3>Clan Controls</h3>

        <div className="controls-section">
          <h4>Ally Requests</h4>
          {userClan.pendingAllyRequests.length === 0 ? (
            <p>No pending ally requests</p>
          ) : (
            userClan.pendingAllyRequests.map((request: AllyRequest) => (
              <div key={request.id} className="ally-request">
                <span>[{request.fromClanTag}] {request.fromClanName}</span>
                <button
                  onClick={() => acceptAllyRequest(request.id)}
                  className="clan-btn-primary"
                >
                  Accept
                </button>
              </div>
            ))
          )}
        </div>

        <div className="controls-section">
          <h4>Send Ally Request</h4>
          <div className="clan-search">
            {allClans.filter(c => c.id !== userClan.id && !userClan.allyIds.includes(c.id)).slice(0, 10).map(clan => (
              <div key={clan.id} className="clan-item-mini">
                <span>[{clan.tag}] {clan.name}</span>
                <button onClick={() => sendAllyRequest(clan.id)} className="clan-btn-small">
                  Send Request
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="controls-section">
          <h4>Declare War</h4>
          <div className="clan-search">
            {allClans.filter(c => c.id !== userClan.id && !userClan.enemyIds.includes(c.id)).slice(0, 10).map(clan => (
              <div key={clan.id} className="clan-item-mini">
                <span>[{clan.tag}] {clan.name}</span>
                <button onClick={() => declareWar(clan.id)} className="clan-btn-small clan-btn-danger">
                  Declare War
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clan-modal">
      <div className="clan-modal-header">
        <h1>Clans</h1>
        <div className="main-tabs">
          <button
            className={mainTab === 'all' ? 'active' : ''}
            onClick={() => { setMainTab('all'); setSelectedClan(null); }}
          >
            All Clans
          </button>
          <button
            className={mainTab === 'your' ? 'active' : ''}
            onClick={() => setMainTab('your')}
          >
            Your Clan
          </button>
        </div>
      </div>

      <div className="clan-modal-content">
        {mainTab === 'all' && (
          <div className="all-clans-tab">
            {!selectedClan ? (
              <>
                <div className="search-bar">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => searchClans(e.target.value)}
                    placeholder="Search clans..."
                  />
                </div>

                <div className="clans-list">
                  {loading ? (
                    <p>Loading...</p>
                  ) : allClans.length === 0 ? (
                    <p>No clans found</p>
                  ) : (
                    allClans.map((clan) => (
                      <div
                        key={clan.id}
                        className="clan-item"
                        onClick={() => viewClanProfile(clan)}
                      >
                        <div className="clan-item-header">
                          <h3 style={{ color: getColorValue(clan.mainColor) }}>[{clan.tag}] {clan.name}</h3>
                          <span className="clan-members">{clan.memberCount} members</span>
                        </div>
                        <p className="clan-item-desc">{clan.description || 'No description'}</p>
                        <div className="clan-item-stats">
                          <span>Kills: {numberWithCommas(clan.totalKills)}</span>
                          <span>XP: {numberWithCommas(clan.totalXP)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="selected-clan-view">
                <button onClick={() => setSelectedClan(null)} className="back-button">
                  ← Back to All Clans
                </button>
                {renderClanProfile(selectedClan, selectedClanMembers)}
              </div>
            )}
          </div>
        )}

        {mainTab === 'your' && (
          <div className="your-clan-tab">
            {!account.isLoggedIn ? (
              <div className="clan-message">
                <p>You must be logged in to view or create a clan.</p>
              </div>
            ) : !account.clan || account.clan.trim() === '' ? (
              <div className="clan-join-create">
                {!showCreateForm ? (
                  <>
                    <h2>You are not in a clan</h2>
                    <div className="clan-actions">
                      <button onClick={() => setMainTab('all')} className="clan-btn-primary">
                        Browse Clans
                      </button>
                      <button onClick={() => setShowCreateForm(true)} className="clan-btn-primary">
                        Create Clan
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="create-clan-form">
                    <h2>Create a Clan</h2>
                    <p>Requires 50,000 mastery</p>

                    <div className="form-group">
                      <label>Clan Name (max 25 chars)</label>
                      <input
                        type="text"
                        value={clanName}
                        onChange={(e) => setClanName(e.target.value)}
                        maxLength={25}
                      />
                    </div>

                    <div className="form-group">
                      <label>Clan Tag (max 5 chars)</label>
                      <input
                        type="text"
                        value={clanTag}
                        onChange={(e) => setClanTag(e.target.value.toUpperCase())}
                        maxLength={5}
                      />
                    </div>

                    <div className="form-group">
                      <label>Description (max 100 chars)</label>
                      <textarea
                        value={clanDescription}
                        onChange={(e) => setClanDescription(e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={clanIsPublic}
                          onChange={(e) => setClanIsPublic(e.target.checked)}
                        />
                        Public Clan (anyone can join)
                      </label>
                    </div>

                    <div className="form-actions">
                      <button onClick={createClan} className="clan-btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Clan'}
                      </button>
                      <button onClick={() => setShowCreateForm(false)} className="clan-btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : userClan ? (
              <>
                <div className="your-clan-tabs">
                  <button
                    className={subTab === 'profile' ? 'active' : ''}
                    onClick={() => setSubTab('profile')}
                  >
                    Profile
                  </button>
                  <button
                    className={subTab === 'chat' ? 'active' : ''}
                    onClick={() => setSubTab('chat')}
                  >
                    Chat
                  </button>
                  <button
                    className={subTab === 'settings' ? 'active' : ''}
                    onClick={() => setSubTab('settings')}
                  >
                    Settings
                  </button>
                  {isOwner && (
                    <button
                      className={subTab === 'controls' ? 'active' : ''}
                      onClick={() => setSubTab('controls')}
                    >
                      Controls
                    </button>
                  )}
                </div>

                <div className="your-clan-content">
                  {subTab === 'profile' && renderClanProfile(userClan, userClanMembers, true)}
                  {subTab === 'chat' && renderChat()}
                  {subTab === 'settings' && renderSettings()}
                  {subTab === 'controls' && renderControls()}
                </div>
              </>
            ) : (
              <p>Loading your clan...</p>
            )}
          </div>
        )}
      </div>

      {/* Treasury Modal */}
      {showTreasury && (
        <div className="treasury-modal">
          <div className="treasury-content">
            <h3>Clan Treasury</h3>
            <p>Clan Gems: {userClan ? numberWithCommas(userClan.clanGems) : 0}</p>
            <p>Your Gems: {numberWithCommas(account.gems)}</p>

            <div className="donation-form">
              <label>Donate Gems:</label>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="1"
                max={account.gems}
              />
              <button onClick={donateGems} className="clan-btn-primary">
                Donate
              </button>
              <button onClick={() => setShowTreasury(false)} className="clan-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClanModal;
