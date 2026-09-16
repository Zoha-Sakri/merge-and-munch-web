import { useState } from 'react'
import './GameLogo.css'

type GameLogoProps = { src?: string; compact?: boolean }

/** Responsive brand component with an accessible image and a text fallback. */
export function GameLogo({ src = '/assets/merge-and-munch-logo.png', compact = false }: GameLogoProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  return <div className={`game-logo ${compact ? 'game-logo--compact' : ''}`} aria-label="Merge and Munch">
    {!imageUnavailable && <img className="game-logo__asset" src={src} alt="Merge & Munch" draggable={false} decoding="async" onError={() => setImageUnavailable(true)} />}
    {imageUnavailable && <span className="game-logo__fallback" aria-hidden="true"><small>MERGE</small><strong>&amp; MUNCH</strong></span>}
  </div>
}
