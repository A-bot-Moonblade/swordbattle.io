import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AccountState, setAccount, updateAccountAsync } from '../../redux/account/slice';
import { Settings } from '../../game/Settings';
import api from '../../api';
import * as cosmetics from '../../game/cosmetics.json'

import './ShopModal.scss'
import { buyFormats, numberWithCommas } from '../../helpers';
let { skins } = cosmetics;

const basePath = 'assets/game/player/';

interface ShopModalProps {
  account: AccountState;
}

interface Skin {
  name: string;
  displayName: string;
  id: number;
  buyable: boolean;
  og: boolean;
  event: boolean;
  tag: string;
  saletag: string;
  eventtag: string;
  sale: boolean;
  freebie: boolean;
  eventoffsale: boolean;
  ultimate: boolean;
  swordFileName: string;
  bodyFileName: string;
  ogprice?: number;
  price?: number;
  description?: string;
}

const rotate = false;

const ShopModal: React.FC<ShopModalProps> = ({ account }) => {
  const dispatch = useDispatch();
  const [skinStatus, setSkinStatus] = useState<{ [id: number]: string }>({});
  const [skinCounts, setSkinCounts] = useState<{ [id: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('norm');

  const skinRefs = useRef<(HTMLImageElement | null)[]>(new Array(Object.keys(skins).length).fill(null));
  // const swordRefs = useRef<(HTMLImageElement | null)[]>(new Array(Object.keys(skins).length).fill(null));

  const highlightSearchTerm = (text: string, term: string) => {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  const assignRef = useCallback((element: HTMLImageElement, index: number) => {
    skinRefs.current[index] = element;
  }, []);
  function handleActionClick(id: number) {

    // If there is action already happening, don't do anything
    if (skinStatus[id]) return;

    const skinAction = account.skins.equipped === id ? null :
                      account.skins.owned.includes(id) ? 'Equipping...' : 'Getting...';

    if (skinAction) {
      setSkinStatus(prev => ({ ...prev, [id]: skinAction }));

      const apiPath = skinAction === 'Equipping...' ? '/equip/' : '/buy/';
      api.post(`${api.endpoint}/profile/cosmetics/skins${apiPath}${id}`, null, (data) => {
        if (data.error) alert(data.error);
        dispatch(updateAccountAsync() as any);
        setSkinStatus(prev => ({ ...prev, [id]: '' }));
      });
    }
  }
  useEffect(() => {
    const handleMouseMove = (event: any) => {
      skinRefs.current.forEach((skinRef, index) => {


        // const swordRef = swordRefs.current[index];
        if (skinRef) {
          const skinRect = skinRef.getBoundingClientRect();
          // const swordRect = swordRef.getBoundingClientRect();

          const { left, top, width, height } = skinRect;
          const x = (left + width / 2);
          const y = (top + height / 2);
          let rad = Math.atan2(event.clientX - x, event.clientY - y);
          let degree = rad * (180 / Math.PI) * -1;

          skinRef.style.transform = `rotate(${degree}deg)`;

        //   const skinCenterX = skinRect.left + skinRect.width / 2;
        //   const skinCenterY = skinRect.top + skinRect.height / 2;

        //    rad = Math.atan2(event.clientX - skinCenterX, event.clientY - skinCenterY);
        //    degree = rad * (180 / Math.PI) * -1 + 140;

        //    const skinRadius = 300; // Adjust as needed
        // const leftOffset = 200; // Adjust as needed
        // const translateX = skinRadius * Math.sin(rad) - leftOffset;
        // const translateY = skinRadius * Math.cos(rad);

        // swordRef.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${degree}deg)`;
        }
      });
    };

    const modal = document.querySelector('.shop-modal');
    if (!modal) return;
    if(rotate) {
    modal.addEventListener('mousemove', handleMouseMove);
    }

    // Fetch skin counts
    api.get(`${api.endpoint}/profile/skins/buys`, (data) => {
      if (data.error) return alert('Error fetching skin cnts '+ data.error);
      setSkinCounts(data);
    });

    return () => {
      if (modal && rotate) {
        modal.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="shop-modal">
      <h1 className='shop-title'>Shop</h1>

      {account?.isLoggedIn ? (
      <h1 className='shop-desc'>Gems: {numberWithCommas(account.gems)}<img className={'gem'} src='assets/game/gem.png' alt='Gems' width={30} height={30} />            Mastery: {numberWithCommas(account.ultimacy)}<img className={'gem'} src='assets/game/ultimacy.png' alt='Gems' width={30} height={30} /></h1>
      ) : (
        <h1 className='shop-desc'><b>Login or Signup</b> to buy stuff from the shop!<br/>Earn gems by stabbing players and collecting coins around the map!</h1>
      )}

<div className='search-bar'>
<input
        type="text"
        placeholder="Search skins..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
</div>

<div className="badges">
<button onClick={() => setSelectedBadge('norm')} className={selectedBadge === 'norm' ? 'active' : ''}>Normal Skins</button>
<button onClick={() => setSelectedBadge('sale')} className={selectedBadge === 'sale' ? 'active' : ''} data-selected-badge="sale">Skins On Sale</button>
<button onClick={() => setSelectedBadge('event')} className={selectedBadge === 'event' ? 'active' : ''} data-selected-badge="event">Event Skins</button>
{account?.isLoggedIn && (
          <button onClick={() => setSelectedBadge('ultimate')} className={selectedBadge === 'ultimate' ? 'active' : ''} data-selected-badge="ultimate">Ultimate Skins</button>
          )}
{account?.isLoggedIn && (
          <button onClick={() => setSelectedBadge('own')} className={selectedBadge === 'own' ? 'active' : ''} data-selected-badge="own">Owned Skins</button>
          )}

        
  { Object.values(skins).filter((skinData: any) =>  skinData.og && account?.skins.owned.includes(skinData.id)).length > 0 && (
    <>
        <button onClick={() => setSelectedBadge('og')} className={selectedBadge === 'og' ? 'active' : ''} data-selected-badge="og">OG Skins</button>
        </>
  )}
      </div>
      <center>
      {selectedBadge === 'og' && (
          <p style={{marginTop: 0}}>OG skins are skins that were available in the original version of the game before 2024.<br/>They are no longer obtainable, but can still be equipped from this menu.</p>
        )}
        {selectedBadge === 'event' && (
          <p style={{marginTop: 0}}>Event skins are available from holidays or seasonal events that happen annually, and can no longer be bought once the event ends.<br></br> They'll never be unbuyable permanently, so make sure to drop by during these events to claim them!</p>
        )}
      {selectedBadge === 'own' && (
          <p style={{marginTop: 0}}>Skins you own can still be equipped from other menus, but using this menu will make it much easier to find them.</p>
        )}
      {selectedBadge === 'ultimate' && (
          <p style={{marginTop: 0}}>Ultimate skins are remakes of normal skins and are obtained by earning mastery instead of spending gems. <br></br>(UNLOCKING ULTIMATE SKINS DOES NOT TAKE AWAY ANY MASTERY)</p>
        )}
      </center>
      <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (selectedBadge === 'og' && !skin.og) return false;
        if (selectedBadge === 'new' && skin.og) return false;
        if (selectedBadge === 'new' && skin.ultimate) return false;
        if (selectedBadge === 'norm' && skin.ultimate) return false;
        if (selectedBadge === 'ultimate' && !skin.ultimate) return false;
        if (selectedBadge === 'new' && skin.eventoffsale) return false;
        if (selectedBadge === 'norm' && skin.freebie) return false;
        if (selectedBadge === 'norm' && skin.eventoffsale) return false;
        if (selectedBadge === 'norm' && skin.event) return false;
        if (selectedBadge === 'norm' && skin.og) return false;
        if (selectedBadge === 'sale' && !skin.sale) return false;
        if (selectedBadge === 'event' && skin.freebie) return true;
        if (selectedBadge === 'event' && skin.eventoffsale) return true;
        if (selectedBadge === 'event' && !skin.event) return false;
        if (selectedBadge === 'own' && skin.og) return false;
        if (selectedBadge === 'own' && !account?.skins.owned.includes(skin.id)) return false;
        if (selectedBadge === 'og' && !account?.skins.owned.includes(skin.id)) return false;

        return skin.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      }).sort((a: any, b: any) => a.price - b.price).map((skinData: any, index) => {
        const skin = skinData as Skin;
        return (
        <div className="skin-card" key={skin.name}>
          <h2 className="skin-name" dangerouslySetInnerHTML={{ __html: highlightSearchTerm(skin.displayName, searchTerm) }}></h2>
          {skin.ultimate && (
            <p className='skin-tag'>{skin.tag}</p>
          )}
          {skin.sale && (
            <p className='skin-saletag'>{skin.saletag}</p>
          )}
          {skin.event && (
            <p className='skin-eventtag'>{skin.eventtag}</p>
          )}
          {skin.eventoffsale && (
            <p className='skin-eventtag'>{skin.eventtag}</p>
          )}
          {skin.freebie && (
            <p className='skin-eventtag'>{skin.eventtag}</p>
          )}
          <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => assignRef(el as HTMLImageElement, index)}
            className='skin-img'
            data-selected='skin'
          />
          {Settings.swords && (
          <img
          src={basePath + skin.swordFileName}
          alt={skin.name}
          ref={(el) => assignRef(el as HTMLImageElement, index)}
          className='skin-sword'
          data-selected='skin'
        />
          )}
          <h4 className='skin-count'>{Object.keys(skinCounts ?? {}).length > 0 ? buyFormats(skinCounts[skin.id] ?? 0) : '...'} buys
          <br/>
          <p className='skin-desc'>{skin.description}</p>
          {
  (skin?.price ?? 0) > 0 ? (
    <>
      {skin?.sale 
        && <> <span className="sale">
        {skin?.ogprice}
      </span><span>‎ ‎ ‎</span> </>
      }
      {skin?.price} 
      {skin?.ultimate 
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={30} height={30} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={30} height={30} />
      }
    </>
  ) : (
    <>
      <p style={{ marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 7 }}>
      {skin?.sale 
        && <> <span className="sale">
        {skin?.ogprice}
      </span><span>‎ ‎ ‎</span> </>
      }
        {skin?.ultimate ? (
  <>
    {skin.buyable ? '0' : ''}
    <img className="gem" src="assets/game/ultimacy.png" alt="Mastery" width={30} height={30} />
  </>
) : (
  skin?.buyable ? 'Free' : ''
)}
      </p>
    </>
  )
}
          </h4>
          {(account?.isLoggedIn && (skin.buyable || account.skins.owned.includes(skin.id)) && (
  <button className='buy-button' onClick={() => handleActionClick(skin.id)}>
    {skinStatus[skin.id] || (account.skins.equipped === skin.id ? 'Equipped' :
      account.skins.owned.includes(skin.id) ? 'Equip' : skin.ultimate ? 'Unlock' : 'Buy')}
  </button>
))}
        </div>
      )
      }
      )}
      </div>
    </div>
  );
}

ShopModal.displayName = 'ShopModal';

export default ShopModal;
