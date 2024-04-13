export enum TILE_STATUS {
  HIDDEN = "HIDDEN",
  MARKED = "MARKED",
  SHOW = "SHOW",
}
export interface ITile {
  x: number; // control position
  y: number; // control position
  isMine: boolean; // if tile contains mine
  status: TILE_STATUS; // status control layout
  text: string; //text control tile's number text
}
export interface IPosition {
  x: number;
  y: number;
}
