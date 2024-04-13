export enum TILE_STATUS {
  HIDDEN = "HIDDEN",
  MARKED = "MARKED",
  SHOW = "SHOW",
}
export interface ITile {
  x: number;
  y: number;
  isMine: boolean;
  status: TILE_STATUS;
  text: string;
}
export interface IPosition {
  x: number;
  y: number;
}
