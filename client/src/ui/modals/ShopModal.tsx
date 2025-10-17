import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AccountState, setAccount, updateAccountAsync } from '../../redux/account/slice';
import { Settings } from '../../game/Settings';
import api from '../../api';
import * as cosmetics from '../../game/cosmetics.json'

import './ShopModal.scss'
import { buyFormats, numberWithCommas, sinceFrom } from '../../helpers';
import { Id } from '@reduxjs/toolkit/dist/tsHelpers';
let { skins } = cosmetics;

const basePath = 'assets/game/player/';

const timereset = 23;

interface ShopModalProps {
  account: AccountState;
}

interface Skin {
  name: string;
  displayName: string;
  id: number;
  buyable: boolean;
  swordFileName: string;
  bodyFileName: string;
  price?: number;
  description?: string;

  og: boolean;

  ultimate: boolean;
  tag: string;
  original?: number;
  
  event: boolean;
  eventoffsale: boolean;
  eventtag: string;
  
  sale: boolean;
  saletag: string;
  ogprice?: number;

  currency: boolean;
}

const rotate = false;

const ShopModal: React.FC<ShopModalProps> = ({ account }) => {
  const dispatch = useDispatch();
  const [skinStatus, setSkinStatus] = useState<{ [id: number]: string }>({});
  const [skinCounts, setSkinCounts] = useState<{ [id: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('norm');
  const [shopDayKey, setShopDayKey] = useState<string>(() => getShopDayKey());
  const [timeUntilResetMs, setTimeUntilResetMs] = useState<number>(() => msUntilNextReset());

  const skinRefs = useRef<(HTMLImageElement | null)[]>(new Array(Object.keys(skins).length).fill(null));
  // const swordRefs = useRef<(HTMLImageElement | null)[]>(new Array(Object.keys(skins).length).fill(null));

  const highlightSearchTerm = (text: string, term: string) => {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  const assignRef = useCallback((element: HTMLImageElement, index: number) => {
    skinRefs.current[index] = element;
  }, []);

  function accountHasBan() {
    return account?.isLoggedIn && account?.username?.startsWith(".");
  }

  function handleActionClick(id: number) {
    // If there is action already happening, don't do anything
    if (skinStatus[id]) return;

    if (accountHasBan() && account.skins.equipped !== id && account.skins.owned.includes(id)) {
      alert("Skins cannot be equipped");
      return;
    }

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

  const targetParentRef = useRef<HTMLDivElement>(null);
  const targetElementRef1 = useRef<HTMLDivElement>(null);
  const targetElementRefFree = useRef<HTMLDivElement>(null);

  const scrollToTarget = () => {
    if (targetParentRef.current && targetElementRef1.current) {
      targetElementRef1.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Target element not found");
    }
  };

  const scrollToTargetFree = () => {
    if (targetParentRef.current && targetElementRefFree.current) {
      targetElementRefFree.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Free Gems target element not found");
    }
  };

  const targetElementRef2 = useRef<HTMLDivElement>(null);

  const scrollToTarget2 = () => {
    if (targetParentRef.current && targetElementRef2.current) {
      targetElementRef2.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Target element not found");
    }
  };

  const targetElementRef3 = useRef<HTMLDivElement>(null);

  const scrollToTarget3 = () => {
    if (targetParentRef.current && targetElementRef3.current) {
      targetElementRef3.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Target element not found");
    }
  };

  const targetElementRef4 = useRef<HTMLDivElement>(null);

  const scrollToTarget4 = () => {
    if (targetParentRef.current && targetElementRef4.current) {
      targetElementRef4.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Target element not found");
    }
  };

  const targetElementRef5 = useRef<HTMLDivElement>(null);

  const scrollToTarget5 = () => {
    if (targetParentRef.current && targetElementRef5.current) {
      targetElementRef5.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Target element not found");
    }
  };

  function getShopDayKey(now = new Date()) {
    const shifted = new Date(now.getTime() - timereset * 60 * 60 * 1000);
    const y = shifted.getUTCFullYear();
    const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const d = String(shifted.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function msUntilNextReset(now = Date.now()) {
    const nowDate = new Date(now);
    const year = nowDate.getUTCFullYear();
    const month = nowDate.getUTCMonth();
    const date = nowDate.getUTCDate();
    let resetMs = Date.UTC(year, month, date, timereset, 0, 0);
    if (now >= resetMs) resetMs += 24 * 60 * 60 * 1000;
    return resetMs - now;
  }

  function seedFromString(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed: number) {
    return function() {
      let t = (seed += 0x6D2B79F5) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle<T>(arr: T[], seedStr: string) {
    const a = arr.slice();
    const rng = mulberry32(seedFromString(seedStr));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function computeGlobalSkinList(): number[] {
    const allSkins = Object.values(skins) as any[];
    const eligible = allSkins.filter((skin: any) =>
      !skin.event &&
      !skin.og &&
      !skin.ultimate &&
      !skin.eventoffsale &&
      skin.price > 0 &&
      skin.buyable &&
      !(skin.description || '').includes('Given')
    );

    const sortedByPriceDesc = [...eligible].sort((a, b) => (b.price || 0) - (a.price || 0));
    const top15 = sortedByPriceDesc.slice(0, 15).map(s => s.id);
    const topSet = new Set(top15);

    const shuffleArray = <T,>(arr: T[]) => seededShuffle(arr, shopDayKey);

    const pickUnique = (pool: any[], count: number, selected: Set<number>) => {
      const candidates = shuffleArray(pool.map((s: any) => s.id)).filter((id: number) => !selected.has(id) && !topSet.has(id));
      const picked = candidates.slice(0, count);
      picked.forEach((id: number) => selected.add(id));
      return picked;
    };

    const bucket1 = eligible.filter(s => s.price >= 1 && s.price <= 500);
    const bucket2 = eligible.filter(s => s.price > 500 && s.price <= 5000);
    const bucket3 = eligible.filter(s => s.price > 5000);

    const selectedSet = new Set<number>();
    const picks: number[] = [];
    picks.push(...pickUnique(bucket1, 15, selectedSet));
    picks.push(...pickUnique(bucket2, 15, selectedSet));
    picks.push(...pickUnique(bucket3, 15, selectedSet));

    const needed = 45 - picks.length;
    if (needed > 0) {
      const remainingPool = shuffleArray(eligible.map(s => s.id)).filter((id: number) => !selectedSet.has(id) && !topSet.has(id));
      const fill = remainingPool.slice(0, needed);
      fill.forEach((id: number) => selectedSet.add(id));
      picks.push(...fill);
    }

    let newSkinList = [...picks.slice(0, 45), ...top15];
    if (newSkinList.length < 60) {
      const remaining = shuffleArray(eligible.map(s => s.id)).filter((id: number) => !newSkinList.includes(id));
      newSkinList.push(...remaining.slice(0, 60 - newSkinList.length));
    }
    const uniqueList = Array.from(new Set(newSkinList)).slice(0, 60);
    const finalList = uniqueList.length === 60 ? uniqueList : newSkinList.slice(0, 60);
    return finalList;
  }
  useEffect(() => {
    // initial fetch
    api.get(`${api.endpoint}/profile/skins/buys`, (data) => {
      if (data.error) return alert('Error fetching skin cnts '+ data.error);
      setSkinCounts(data);
    });

    // countdown update every second
    const tick = () => {
      setTimeUntilResetMs(msUntilNextReset());
    };
    tick();
    const intervalId = setInterval(tick, 1000);

    // schedule exact reset action
    let timeoutId: any;
    const schedule = () => {
      const ms = msUntilNextReset();
      timeoutId = setTimeout(() => {
        setShopDayKey(getShopDayKey(new Date()));
        // refresh counts and images on reset
        api.get(`${api.endpoint}/profile/skins/buys`, (data) => {
          if (!data?.error) setSkinCounts(data);
        });
        // re-schedule for next day
        schedule();
      }, ms + 50); // slight buffer
    };
    schedule();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // compute today's global shop list based on UTC 03:00
  const todaysGlobalSkinList = computeGlobalSkinList();

  return (
    <div className="shop-modal">
      <div className="shop-extra">
      <h1 className='shop-title'>Shop</h1>
      {account?.isLoggedIn ? (
      <h1 className='shop-desc'>Gems: {numberWithCommas(account.gems)}<img className={'gem'} src='assets/game/gem.png' alt='Gems' width={30} height={30} /><br />Mastery: {numberWithCommas(account.mastery)}<img className={'gem'} src='assets/game/ultimacy.png' alt='Gems' width={30} height={30} /></h1>
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

<h1 className='shop-desc-extra'>(Skins may take a while to fully load)</h1>
<div className="badges">
<button onClick={scrollToTargetFree} data-selected-badge="own">Free Gems</button>
<button onClick={scrollToTarget}>Today's Skins</button>
<button onClick={scrollToTarget2} data-selected-badge="ultimate">Ultimate Skins</button>
<button onClick={scrollToTarget3} data-selected-badge="event">Event Skins</button>
      </div>
      </div>
      {searchTerm && (
        <>
        <div className='scroll' ref={targetParentRef}>
        <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (skin.og) return false;
        if (skin.eventoffsale) return false;
        if (skin.price === 0) return false;
        if (skin.description?.includes("Given")) return false;
        
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

          {/* Get image width from src */}
            {(() => {
            // Create a variable to store the width
            let imgWidth = 0;
            const img = new window.Image();
            img.src = basePath + skin.bodyFileName;
            img.onload = () => {
              imgWidth = img.naturalWidth;
            };
            // This will not be reactive, but will be used below
            return null;
            })()}

            <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-img-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-img';
                } else {
                el.className = 'skin-img-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
            <img
            src={basePath + skin.swordFileName}
            alt={skin.name}
           ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-sword-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-sword';
                } else {
                el.className = 'skin-sword-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
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
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={20} height={20} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={20} height={20} />
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
        </div>
      )
      }
      )}
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      </div>
        </>
      )}
      {!searchTerm && (
          <>
          <div className='scroll' ref={targetParentRef}>
        <div ref={targetElementRefFree}></div>
        <div className='label'>
        <span>Free Gems + Skin</span><hr></hr>
        <p>Claim before 10/17</p>
        </div>
        <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (skin.og) return false;
        if (!skin.sale) return false;
        return skin.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      }).sort((a: any, b: any) => a.id - b.id).map((skinData: any, index) => {
        const skin = skinData as Skin;
        return (
        <div className="skin-card" key={skin.name}>
            <h2 className="skin-name" dangerouslySetInnerHTML={{ __html: highlightSearchTerm(skin.displayName, searchTerm) }}></h2>
            {skin.id === 501 && ( 
              <>
              {/* Get image width from src */}
            {(() => {
            // Create a variable to store the width
            let imgWidth = 0;
            const img = new window.Image();
            img.src = basePath + skin.bodyFileName;
            img.onload = () => {
              imgWidth = img.naturalWidth;
            };
            // This will not be reactive, but will be used below
            return null;
            })()}

            <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-img-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-img';
                } else {
                el.className = 'skin-img-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
            <img
            src={basePath + skin.swordFileName}
            alt={skin.name}
           ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-sword-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-sword';
                } else {
                el.className = 'skin-sword-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
              </>
            )}
            {skin.id === 500 && ( 
              <>
              <img
              src="assets/game/gem.png"
              alt="Gem"
              className="skin-img"
              data-selected="skin"
              style={{ transform: 'scale(0.9) translateY(-10px)' }}
              />
              </>
            )}
            <br/>
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
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={20} height={20} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={20} height={20} />
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
          {account?.isLoggedIn && (
            skin.id === 501 || (skin.currency === true ? (skin.buyable && !account.skins.owned.includes(skin.id)) : true)
          ) && (
            <button className='buy-button' onClick={() => handleActionClick(skin.id)}>
              {skinStatus[skin.id] || (
                skin.currency === true
                  ? (skin.ultimate ? 'Unlock' : 'Get')
                  : (account.skins.equipped === skin.id ? 'Equipped' :
                      account.skins.owned.includes(skin.id) ? 'Equip' :
                      skin.ultimate ? 'Unlock' : 'Get')
          )}
  </button>
)}
        </div>
      )
      })}
      </div>

        <div className='label'>
        <div ref={targetElementRef1}></div>
        <span>Today's Skins</span><hr></hr>
        {(() => {
          const ms = timeUntilResetMs;
          if (ms <= 0) return <p>Resets in less than a minute</p>;
          const hours = Math.floor(ms / (1000 * 60 * 60));
          const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
          if (hours >= 1) return <p>Resets in {hours} hour{hours > 1 ? 's' : ''} {minutes} minute{minutes !== 1 ? 's' : ''}</p>;
          if (minutes >= 1) return <p>Resets in {minutes} minute{minutes !== 1 ? 's' : ''}</p>;
          return <p>Resets in less than a minute</p>;
        })()}</div>
        <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (!todaysGlobalSkinList.includes(skin.id)) return false;
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

            {/* Get image width from src */}
            {(() => {
            // Create a variable to store the width
            let imgWidth = 0;
            const img = new window.Image();
            img.src = basePath + skin.bodyFileName;
            img.onload = () => {
              imgWidth = img.naturalWidth;
            };
            // This will not be reactive, but will be used below
            return null;
            })()}

            <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-img-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-img';
                } else {
                el.className = 'skin-img-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
            <img
            src={basePath + skin.swordFileName}
            alt={skin.name}
           ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-sword-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-sword';
                } else {
                el.className = 'skin-sword-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
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
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={20} height={20} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={20} height={20} />
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
      <br /><br /><br /><br /><br /><br /><br /><br />
        <div ref={targetElementRef2}></div>
        <div className='label'>
        <span>Ultimate Skins</span><hr></hr>
        <p>Ultimate skins are remakes of normal skins and are obtained by earning mastery instead of spending gems.<br /><span style={{color: 'red'}}>Unlocking ultimate skins DOES NOT take away any mastery. The original skin must be owned before unlocking the ultimate version.</span><br />(The original version of an Ultimate is based on it's Tag. For example, the "Ultimate Blueberry" Tag means the original skin is Blueberry)</p>
        </div>
        <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (skin.og) return false;
        if (!skin.ultimate) return false;
        
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

          {/* Get image width from src */}
            {(() => {
            // Create a variable to store the width
            let imgWidth = 0;
            const img = new window.Image();
            img.src = basePath + skin.bodyFileName;
            img.onload = () => {
              imgWidth = img.naturalWidth;
            };
            // This will not be reactive, but will be used below
            return null;
            })()}

            <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-img-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-img';
                } else {
                el.className = 'skin-img-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
            <img
            src={basePath + skin.swordFileName}
            alt={skin.name}
           ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-sword-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-sword';
                } else {
                el.className = 'skin-sword-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
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
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={20} height={20} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={20} height={20} />
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
      <br /><br /><br /><br /><br /><br /><br /><br />
      <div ref={targetElementRef3}></div>
        <div className='label'>
        <span>Event Skins</span><hr></hr>
        <p>There are currently no event skins on sale.</p>
        </div>
        <div className='skins'>
      {Object.values(skins).filter((skinData: any) => {
        const skin = skinData as Skin;
        if (skin.og) return false;
        if (!skin.event) return false;
        
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

          {/* Get image width from src */}
            {(() => {
            // Create a variable to store the width
            let imgWidth = 0;
            const img = new window.Image();
            img.src = basePath + skin.bodyFileName;
            img.onload = () => {
              imgWidth = img.naturalWidth;
            };
            // This will not be reactive, but will be used below
            return null;
            })()}

            <img
            src={basePath + skin.bodyFileName}
            alt={skin.name}
            ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-img-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-img';
                } else {
                el.className = 'skin-img-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
            <img
            src={basePath + skin.swordFileName}
            alt={skin.name}
           ref={(el) => {
              assignRef(el as HTMLImageElement, index);
              if (el) {
              // Get width from the image src instead of el.naturalWidth
              const tempImg = new window.Image();
              tempImg.src = basePath + skin.bodyFileName;
              tempImg.onload = () => {
                if (tempImg.naturalWidth === 300) {
                el.className = 'skin-sword-large';
                } else if (tempImg.naturalWidth === 274) {
                el.className = 'skin-sword';
                } else {
                el.className = 'skin-sword-small';
                }
              };
              }
            }}
            data-selected='skin'
            />
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
        ? <img className={'gem'} src='assets/game/ultimacy.png' alt='Mastery' width={20} height={20} />
        : <img className={'gem'} src='assets/game/gem.png' alt='Gems' width={20} height={20} />
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
      <br /><br /><br /><br /><br /><br /><br /><br />
      </div>
          </>
        )}
      
    </div>
  );
}

ShopModal.displayName = 'ShopModal';

export default ShopModal;
