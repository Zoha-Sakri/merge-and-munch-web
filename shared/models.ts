/** Cross-platform game domain contracts. Mirror these in Kotlin and Swift. */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export interface MergeItem { id: string; chainId: string; stage: number; label: string; rarity: Rarity; points: number }
export interface BoardTile { index: number; item?: MergeItem; obstacle?: 'locked' | 'ice' | 'crate' }
export interface PlayerSave { schemaVersion: 1; coins: number; gems: number; stars: number; board: BoardTile[]; updatedAt: number }
export interface SaveRepository { load(): Promise<PlayerSave | null>; save(data: PlayerSave): Promise<void> }
