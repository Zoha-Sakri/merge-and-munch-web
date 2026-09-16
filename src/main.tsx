import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { GameLogo } from './components/GameLogo'
import { readVersioned, writeSaved } from './storage'

type Screen = 'home' | 'game' | 'shop' | 'achievements' | 'settings'
type Tile = { id: number; chain: string; stage: number; locked?: boolean; ice?: boolean } | null
type ItemChain = { id: string; name: string; icon: string; colors: string[]; stages: string[] }
type CityBuilding = { name: string; icon: string; level: number; cost: number; detail: string }
type FarmAnimal = { name: string; icon: string; product: string; ready: boolean }

const chains: ItemChain[] = [
  { id: 'tomato', name: 'Tomato', icon: '🍅', colors: ['#ff7a67','#ffad82','#ff7660','#e9544e','#cc4853','#9f3855'], stages: ['Tomato','Sliced tomato','Roasted tomato','Market sauce','Chef sauce','Royal sauce'] },
  { id: 'bread', name: 'Bread', icon: '🍞', colors: ['#ffd28e','#f6b85f','#e69a53','#d5833f','#bc6539','#8f4d42'], stages: ['Dough','Toast','Golden bread','Brioche','Stuffed loaf','Cloud bun'] },
  { id: 'cheese', name: 'Cheese', icon: '🧀', colors: ['#ffe768','#ffd84e','#ffc83e','#eda939','#d88538','#bb663e'], stages: ['Curd','Cheese cube','Cheese slice','Melty cheese','Cheddar wheel','Sun cheese'] },
  { id: 'lettuce', name: 'Lettuce', icon: '🥬', colors: ['#aeea72','#8cdb67','#70c65e','#55ae57','#3d9051','#28754b'], stages: ['Leaf','Washed leaf','Crisp lettuce','Garden greens','Herb bunch','Emerald salad'] },
  { id: 'onion', name: 'Onion', icon: '🧅', colors: ['#f3cae6','#e8a7d2','#d883c1','#bf64ad','#9e4d9a','#7d3d81'], stages: ['Onion','Rings','Sweet onion','Caramel onion','Purple relish','Moon jam'] },
  { id: 'patty', name: 'Patty', icon: '🍔', colors: ['#c57b59','#ac634b','#925040','#7a4039','#633836','#50313a'], stages: ['Mince','Patty','Grilled patty','Double patty','Smoky stack','Legend patty'] },
  { id: 'fries', name: 'Fries', icon: '🍟', colors: ['#ffe17b','#ffd35e','#f6bd48','#e4a13e','#ca8337','#a96736'], stages: ['Potato','Cut potato','Fries','Crispy fries','Seasoned fries','Golden basket'] },
  { id: 'drink', name: 'Drink', icon: '🥤', colors: ['#9de5ff','#71d3fa','#57b8ef','#458fdc','#4f6fc5','#584da5'], stages: ['Ice cube','Lemonade','Berry drink','Sparkle soda','Cooler','Star fizz'] },
  { id: 'cake', name: 'Dessert', icon: '🧁', colors: ['#ffb6c8','#fc91b5','#f978a7','#e76099','#cc4b91','#a93f87'], stages: ['Berry','Cream','Cupcake','Layer cake','Party cake','Dream dessert'] },
  { id: 'pizza', name: 'Pizza', icon: '🍕', colors: ['#ffcf80','#f9b85c','#ee9952','#e47a47','#cf5e42','#a84740'], stages: ['Dough ball','Pizza base','Cheese pizza','Veggie pizza','Supreme pizza','Galaxy pizza'] },
  { id: 'sushi', name: 'Sushi', icon: '🍣', colors: ['#bdeee0','#8cd9cf','#68c5bd','#55aaa8','#478d91','#3d707b'], stages: ['Rice','Roll','Sushi bite','Sushi plate','Rainbow sushi','Ocean feast'] },
  { id: 'juice', name: 'Juice', icon: '🍊', colors: ['#ffd47a','#ffc052','#f99b42','#ec7840','#d8583c','#b53d47'], stages: ['Orange','Orange slice','Juice cup','Fresh juice','Sun smoothie','Tropical splash'] },
]

const initialBoard = (): Tile[] => [
  { id: 1, chain: 'tomato', stage: 0 }, { id: 2, chain: 'cheese', stage: 0 }, { id: 3, chain: 'tomato', stage: 0 }, null, { id: 5, chain: 'bread', stage: 0 },
  { id: 6, chain: 'lettuce', stage: 0 }, { id: 7, chain: 'cheese', stage: 0 }, { id: 8, chain: 'bread', stage: 0 }, { id: 9, chain: 'juice', stage: 0 }, { id: 10, chain: 'cake', stage: 0 },
  { id: 11, chain: 'fries', stage: 0 }, null, { id: 13, chain: 'lettuce', stage: 0 }, { id: 14, chain: 'drink', stage: 0 }, { id: 15, chain: 'fries', stage: 0 },
  { id: 16, chain: 'onion', stage: 0 }, { id: 17, chain: 'onion', stage: 0 }, null, { id: 19, chain: 'pizza', stage: 0 }, { id: 20, chain: 'pizza', stage: 0 },
  { id: 21, chain: 'patty', stage: 0 }, { id: 22, chain: 'sushi', stage: 0 }, { id: 23, chain: 'juice', stage: 0 }, { id: 24, chain: 'cake', stage: 0, ice: true }, null,
]
const getChain = (id: string) => chains.find(c => c.id === id)!
const createAchievements = () => Array.from({ length: 120 }, (_, index) => ({ title: ['First Pop!', 'Merge Master', 'Fast Chef', 'Market Star'][index % 4], value: Math.min(100, index * 2 + 8), icon: ['✨','🏆','⚡','🍓'][index % 4] }))

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [board, setBoard] = useState<Tile[]>(() => readVersioned('tmm-board', initialBoard()))
  const [selected, setSelected] = useState<number | null>(null)
  const [coins, setCoins] = useState(() => readVersioned('tmm-coins', 1240))
  const [stars, setStars] = useState(() => readVersioned('tmm-stars', 18))
  const [energy, setEnergy] = useState(5)
  const [toast, setToast] = useState('')
  const [combo, setCombo] = useState(0)
  const [orders, setOrders] = useState([{ chain: 'tomato', stage: 1, count: 1, name: 'Garden sauce' }, { chain: 'cheese', stage: 0, count: 2, name: 'Cheese bites' }])
  const [settings, setSettings] = useState({ sound: true, music: true, motion: true, contrast: false })
  const [claimed, setClaimed] = useState(false)
  const [theme, setTheme] = useState('Sunny Farm')
  const [buildings, setBuildings] = useState<CityBuilding[]>(() => readVersioned('tmm-buildings', [{ name: 'Community Hall', icon: '🏛️', level: 1, cost: 260, detail: 'A place for neighbors to gather' }, { name: 'Harvest Cafe', icon: '🍽️', level: 1, cost: 340, detail: 'Serve recipes to hungry citizens' }, { name: 'Sky Garden', icon: '🏰', level: 0, cost: 520, detail: 'A wonder for the whole valley' }]))
  const [animals, setAnimals] = useState<FarmAnimal[]>(() => readVersioned('tmm-animals', [{ name: 'Clover', icon: '🐄', product: 'Fresh milk', ready: true }, { name: 'Hazel', icon: '🐔', product: 'Golden eggs', ready: true }, { name: 'Bramble', icon: '🐑', product: 'Soft wool', ready: true }]))
  const [tunnel, setTunnel] = useState<{ unlocked: boolean; depth: number }>(() => readVersioned('tmm-tunnel', { unlocked: false, depth: 0 }))

  useEffect(() => { writeSaved('tmm-board', board); writeSaved('tmm-coins', coins); writeSaved('tmm-stars', stars); writeSaved('tmm-buildings', buildings); writeSaved('tmm-animals', animals); writeSaved('tmm-tunnel', tunnel) }, [board, coins, stars, buildings, animals, tunnel])
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 1600); return () => clearTimeout(t) }, [toast])

  const mergeAt = (from: number, to: number) => {
    if (from === to || !board[from] || !board[to]) { setSelected(null); return }
    const a = board[from]!, b = board[to]!
    if (a.chain === b.chain && a.stage === b.stage && a.stage < 5) {
      const next = [...board]; next[to] = { ...b, id: Date.now(), stage: b.stage + 1 }; next[from] = null
      setBoard(next); setCoins(c => c + 15 * (b.stage + 1)); setCombo(c => c + 1); setToast(`Sweet merge! +${15 * (b.stage + 1)} coins`); setSelected(null)
    } else { setToast('Those ingredients do not match yet'); setSelected(null) }
  }
  const tapTile = (index: number) => {
    const tile = board[index]
    if (selected === null) { if (tile) setSelected(index); return }
    if (!tile) { const next = [...board]; next[index] = next[selected]; next[selected] = null; setBoard(next); setSelected(null); return }
    mergeAt(selected, index)
  }
  const serve = (orderIndex: number) => {
    const order = orders[orderIndex]; const found = board.findIndex(t => t?.chain === order.chain && t.stage >= order.stage)
    if (found < 0) { setToast('Keep merging — that order is not ready!'); return }
    const next = [...board]; next[found] = null; setBoard(next); setOrders(o => o.filter((_, i) => i !== orderIndex)); setCoins(c => c + 65); setStars(s => s + 1); setToast('Perfect serve! +65 coins');
  }
  const startGame = () => { if (energy <= 0) { setToast('Your energy is refilling soon'); return }; setEnergy(e => e - 1); setScreen('game') }
  const collectAnimal = (index: number) => { const animal = animals[index]; if (!animal.ready) { setToast(`${animal.name} is resting`); return }; setAnimals(list => list.map((item, i) => i === index ? { ...item, ready: false } : item)); setCoins(c => c + 35); setStars(s => s + 1); setToast(`${animal.product} traded! +35 coins`) }
  const upgradeBuilding = (index: number) => { const building = buildings[index]; if (coins < building.cost) { setToast('Trade more goods for coins first'); return }; setCoins(c => c - building.cost); setBuildings(list => list.map((item, i) => i === index ? { ...item, level: item.level + 1, cost: Math.round(item.cost * 1.45) } : item)); setStars(s => s + 2); setToast(`${building.name} upgraded! Citizens are delighted`) }
  const exploreTunnel = () => { if (coins < 120) { setToast('You need 120 coins to prepare an expedition'); return }; setCoins(c => c - 120); setTunnel(t => ({ unlocked: true, depth: t.depth + 1 })); setStars(s => s + 3); setToast('Ancient City expedition complete! +3 stars') }

  return <main className={`app ${settings.contrast ? 'high-contrast' : ''} ${!settings.motion ? 'reduce-motion' : ''}`}>
    <div className="backdrop"><i>✦</i><i>✦</i><i>✦</i><span className="fruit f1">🍓</span><span className="fruit f2">🍋</span><span className="fruit f3">🍒</span></div>
    <header className="topbar"><button className="avatar" onClick={() => setScreen('settings')}>🧒</button><div className="brand"><span>MERGE</span>&amp; MUNCH</div><div className="balances"><span>⚡ {energy}/5</span><span>🪙 {coins.toLocaleString()}</span><span>⭐ {stars}</span></div></header>
    {screen === 'home' && <Home startGame={startGame} setScreen={setScreen} claimed={claimed} claim={() => { if (!claimed) { setCoins(c => c + 120); setClaimed(true); setToast('Day 4 reward claimed! +120 coins') } }} theme={theme} buildings={buildings} animals={animals} tunnel={tunnel} collectAnimal={collectAnimal} upgradeBuilding={upgradeBuilding} exploreTunnel={exploreTunnel} />}
    {screen === 'game' && <Game board={board} selected={selected} tapTile={tapTile} orders={orders} serve={serve} combo={combo} back={() => setScreen('home')} shuffle={() => { setBoard([...board].sort(() => Math.random() - .5)); setToast('Board shuffled!') }} />}
    {screen === 'shop' && <Shop coins={coins} setCoins={setCoins} theme={theme} setTheme={setTheme} toast={setToast} back={() => setScreen('home')} />}
    {screen === 'achievements' && <Achievements back={() => setScreen('home')} />}
    {screen === 'settings' && <Settings settings={settings} setSettings={setSettings} back={() => setScreen('home')} />}
    {toast && <div className="toast">{toast}</div>}
  </main>
}

function Home({ startGame, setScreen, claimed, claim, theme, buildings, animals, tunnel, collectAnimal, upgradeBuilding, exploreTunnel }: { startGame: () => void; setScreen: (s: Screen) => void; claimed: boolean; claim: () => void; theme: string; buildings: CityBuilding[]; animals: FarmAnimal[]; tunnel: { unlocked: boolean; depth: number }; collectAnimal: (index: number) => void; upgradeBuilding: (index: number) => void; exploreTunnel: () => void }) {
  return <section className="home page"><div className="hero-copy"><div className="eyebrow">WORLD 1 · {theme.toUpperCase()}</div><h1>Build a living<br /><em>farm city.</em></h1><p>Grow crops, care for animals, trade your harvest, and bring a whole valley to life.</p><button className="play-button" onClick={startGame}><span>▶</span> PLAY MARKET <small>Level 12</small></button><div className="mini-actions"><button onClick={() => setScreen('shop')}>🛍️ <b>Shop</b><small>Build your town</small></button><button onClick={() => setScreen('achievements')}>🏆 <b>Milestones</b><small>24 / 120</small></button><button onClick={() => setScreen('settings')}>⚙️ <b>Settings</b><small>Made for you</small></button></div></div><div className="market-scene"><div className="sun">☀️</div><div className="cloud c1">☁️</div><div className="cloud c2">☁️</div><div className="stall"><div className="awning"><i></i><i></i><i></i><i></i><i></i></div><div className="stall-sign">FRESH<br/>FUN!</div><div className="produce">🍅 🍞 🍊<br/>🧀 🥬 🧁</div></div><div className="market-logo"><GameLogo /><span>Let’s munch!</span></div><div className="path"></div></div><div className="daily-card"><div className="calendar"><b>DAY</b><strong>04</strong></div><div><b>Daily delight</b><p>Come back each day for a surprise!</p></div><button onClick={claim} disabled={claimed}>{claimed ? 'CLAIMED' : 'CLAIM'}</button></div><div className="city-panel"><div className="section-kicker">YOUR VALLEY</div><h2>Grow, trade, discover</h2><div className="farm-actions"><div className="farm-card"><span className="farm-card-icon">🌾</span><b>Animal ranch</b><small>Collect goods from your neighbors</small><div className="animal-row">{animals.map((animal, i) => <button key={animal.name} onClick={() => collectAnimal(i)} title={animal.product}>{animal.icon}<small>{animal.ready ? 'Collect' : 'Resting'}</small></button>)}</div></div><div className="farm-card"><span className="farm-card-icon">🏙️</span><b>Build the city</b><small>Upgrade places that make citizens happy</small>{buildings.map((building, i) => <button className="building-row" key={building.name} onClick={() => upgradeBuilding(i)}><span>{building.icon}</span><div><b>{building.name} · Lv. {building.level}</b><small>{building.detail}</small></div><strong>🪙 {building.cost}</strong></button>)}</div><div className="farm-card tunnel-card"><span className="farm-card-icon">⛏️</span><b>Ancient City tunnels</b><small>{tunnel.unlocked ? `Depth ${tunnel.depth} · The ruins reveal new paths` : 'Explore the mystery beneath your fields'}</small><button onClick={exploreTunnel}>{tunnel.unlocked ? 'Explore deeper · 🪙 120' : 'Begin expedition · 🪙 120'}</button></div></div></div></section>
}

function Game({ board, selected, tapTile, orders, serve, combo, back, shuffle }: { board: Tile[]; selected: number | null; tapTile: (i: number) => void; orders: { chain: string; stage: number; count: number; name: string }[]; serve: (i: number) => void; combo: number; back: () => void; shuffle: () => void }) {
  return <section className="game page"><div className="game-header"><button className="round-button" onClick={back}>‹</button><div><b>Sunny Farm</b><small>LEVEL 12 · 01:42</small></div><div className="level-progress"><i style={{ width: '64%' }}></i></div><button className="round-button">Ⅱ</button></div><div className="game-layout"><div className="board-area"><div className="hint">{selected === null ? 'Tap an ingredient, then a matching one to merge!' : 'Now choose a matching ingredient'}</div><div className="grid">{board.map((tile, index) => <button key={index} aria-label={tile ? `${getChain(tile.chain).name}, level ${tile.stage + 1}` : 'Empty tile'} onClick={() => tapTile(index)} className={`tile ${tile ? 'filled' : ''} ${selected === index ? 'selected' : ''} ${tile?.ice ? 'ice' : ''}`} style={tile ? { '--food': getChain(tile.chain).colors[tile.stage] } as React.CSSProperties : {}}>{tile && <><span className="tile-icon">{getChain(tile.chain).icon}</span><small>Lv. {tile.stage + 1}</small>{tile.ice && <span className="ice-shine">❄</span>}</>}</button>)}</div><div className="powerups"><button title="Undo">↩<small>Undo</small></button><button onClick={shuffle}>🔀<small>Shuffle</small></button><button title="Rainbow merge">🌈<small>Rainbow</small></button><button title="Freeze timer">❄️<small>Freeze</small></button></div></div><aside className="orders"><div className="orders-title"><div><span>ORDERS</span><b>Serve before they leave!</b></div><span className="streak">🔥 {combo}</span></div>{orders.length ? orders.map((order, i) => { const chain = getChain(order.chain); return <button className="order-card" onClick={() => serve(i)} key={order.name}><span className="customer">{i ? '🤖' : '👧🏽'}</span><div className="bubble"><span>{chain.icon}</span><b>{order.name}</b><small>{order.count} item{order.count > 1 ? 's' : ''} · +65 🪙</small></div><i className="patience"><em style={{ width: `${80-i*22}%` }}></em></i></button> }) : <div className="complete-card"><span>🎉</span><b>Orders complete!</b><p>Your market is glowing.</p></div>}<div className="next-customer">Next customer arrives in <b>00:18</b></div></aside></div></section>
}

function Shop({ coins, setCoins, theme, setTheme, toast, back }: { coins: number; setCoins: React.Dispatch<React.SetStateAction<number>>; theme: string; setTheme: (s: string) => void; toast: (s: string) => void; back: () => void }) {
  const items = [{ icon: '🪴', name: 'Happy plant', price: 180 }, { icon: '🕯️', name: 'Cozy lights', price: 250 }, { icon: '🧺', name: 'Fruit basket', price: 160 }, { icon: '🎈', name: 'Party balloons', price: 320 }];
  return <section className="panel-page page"><div className="panel-head"><button className="round-button" onClick={back}>‹</button><div><span>MARKET SHOP</span><h2>Make it yours</h2></div><b>🪙 {coins}</b></div><div className="tabs"><button className="active">Decorations</button><button>Themes</button><button>Boosters</button></div><div className="shop-grid">{items.map(item => <article className="shop-item" key={item.name}><div>{item.icon}</div><b>{item.name}</b><small>Sunny Farm</small><button onClick={() => coins >= item.price ? (setCoins(c => c - item.price), toast(`${item.name} added to your market!`)) : toast('More coins needed!')}>🪙 {item.price}</button></article>)}</div><h3>Market themes</h3><div className="theme-row">{['Sunny Farm','Beach Café','Candy Kingdom'].map((t, i) => <button key={t} onClick={() => { setTheme(t); toast(`${t} is now active`) }} className={`theme ${theme === t ? 'active' : ''}`}><span>{['🌻','🏖️','🍭'][i]}</span><b>{t}</b>{theme === t && <i>✓</i>}</button>)}</div></section>
}

function Achievements({ back }: { back: () => void }) { const achievements = useMemo(createAchievements, []); return <section className="panel-page page"><div className="panel-head"><button className="round-button" onClick={back}>‹</button><div><span>COLLECTION</span><h2>Little wins</h2></div><b>24 / 120</b></div><div className="achievement-hero"><span>🏆</span><div><b>24 achievements unlocked</b><p>Every tiny step helps your market shine.</p><div><i style={{ width: '20%' }}></i></div></div></div><div className="achievement-grid">{achievements.slice(0, 12).map((a, i) => <article className={i > 5 ? 'locked' : ''} key={i}><span>{i > 5 ? '🔒' : a.icon}</span><b>{a.title}</b><small>{a.value}% complete</small></article>)}</div></section> }

function Settings({ settings, setSettings, back }: { settings: { sound: boolean; music: boolean; motion: boolean; contrast: boolean }; setSettings: React.Dispatch<React.SetStateAction<{ sound: boolean; music: boolean; motion: boolean; contrast: boolean }>>; back: () => void }) { const Toggle = ({ label, note, field }: { label: string; note: string; field: keyof typeof settings }) => <button className="setting-row" onClick={() => setSettings(s => ({ ...s, [field]: !s[field] }))}><div><b>{label}</b><small>{note}</small></div><span className={settings[field] ? 'toggle on' : 'toggle'}><i></i></span></button>; return <section className="panel-page settings-page page"><div className="panel-head"><button className="round-button" onClick={back}>‹</button><div><span>HELLO, ALEX</span><h2>Settings</h2></div></div><div className="settings-card"><Toggle label="Sound effects" note="Happy pops, coins and cheers" field="sound"/><Toggle label="Market music" note="Warm tunes while you play" field="music"/><hr/><Toggle label="Gentle motion" note="Reduce busy animations" field="motion"/><Toggle label="High contrast" note="Make colours easier to see" field="contrast"/></div><button className="parent-zone">🔐 Parent Zone <small>Screen time, privacy & account</small></button></section> }

createRoot(document.getElementById('root')!).render(<App />)
