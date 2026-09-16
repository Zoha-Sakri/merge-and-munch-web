import type { BoardTile } from './models'
export const canMerge = (a?: BoardTile, b?: BoardTile) => !!a?.item && !!b?.item && a.item.chainId === b.item.chainId && a.item.stage === b.item.stage && a.item.stage < 5
export function merge(board: BoardTile[], from: number, to: number): BoardTile[] { if (!canMerge(board[from], board[to])) return board; return board.map((tile, index) => index === from ? { ...tile, item: undefined } : index === to && tile.item ? { ...tile, item: { ...tile.item, stage: tile.item.stage + 1 } } : tile) }
