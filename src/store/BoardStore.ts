import { makeAutoObservable } from "mobx";
import { TILE_STATUS } from "../components/type";
const { SHOW, HIDDEN, MARKED } = TILE_STATUS;

interface ITile {
  x: number;
  y: number;
  isMine: boolean;
  status: TILE_STATUS;
  text: string;
}
interface IPosition {
  x: number;
  y: number;
}
class BoardStore {
  board: ITile[][] = [];
  mineList: IPosition[] = [];
  gameStatus = "";
  constructor() {
    makeAutoObservable(this);
  }
  setUp = ({ size }: { size: number }) => {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const tile: ITile = {
          x: i,
          y: j,
          isMine: false,
          status: HIDDEN,
          text: "",
        };
        row.push(tile);
      }
      this.board = [...this.board, row];
    }
  };
  start = ({ size }: { size: number }) => {
    this.board = [];
    this.mineList = [];
    this.gameStatus = "";
    this.setUp({ size });
  };
  onDoubleClick = (tile: ITile) => {
    const nearByTileList = this.getNearByTiles(tile);
    if (
      nearByTileList.filter((tile) => tile.status === MARKED).length ===
      Number(tile.text)
    ) {
      nearByTileList.forEach((nearByTile) => {
        if (nearByTile.status !== MARKED) {
          if (nearByTile.isMine) {
            this.gameStatus = "You lose";
            this.board.forEach((row) => {
              row.forEach((tile) => {
                if (tile.isMine) tile.status = SHOW;
              });
            });
            return;
          }
          nearByTile.status = SHOW;

          nearByTile.text = this.countMineNumber(
            this.getNearByTiles(nearByTile),
          ).toString();
        }
      });
    }
  };
  countMineNumber = (tileList: ITile[]): number =>
    tileList.filter((tile) => tile.isMine).length;
  setMinePositions = (size: number, numberOfMines: number, tile: ITile) => {
    while (this.mineList.length < numberOfMines) {
      const x = this.generateRandomNumber(size);
      const y = this.generateRandomNumber(size);
      const minePosition: IPosition = { x, y };
      if (
        !this.mineList.some((position) =>
          this.positionMatch(minePosition, position),
        ) &&
        tile.x !== x &&
        tile.y !== y
      ) {
        this.board[x][y].isMine = true;
        this.mineList = [...this.mineList, minePosition];
      }
    }
  };

  onClick = (clickedTile: ITile) => {
    this.revealTile(clickedTile);
    if (clickedTile.isMine) {
      this.gameStatus = "You lose";
      this.board.forEach((row) => {
        row.forEach((tile) => {
          if (tile.isMine) tile.status = SHOW;
        });
      });
    } else {
      if (this.checkWin()) {
        this.gameStatus = "You win";
      }
    }
  };

  checkWin = () => {
    return this.board.every((row) =>
      row.every(
        (tile) =>
          tile.status === SHOW || (tile.isMine && tile.status === MARKED),
      ),
    );
  };

  revealTile = (tile: ITile) => {
    if (tile.isMine) {
      return;
    }

    const nearByTileList = this.getNearByTiles(tile);

    const mineCount = nearByTileList.filter((tile) => tile.isMine).length;
    if (mineCount === 0) {
      nearByTileList.forEach((nearByTile) => {
        nearByTile.status = SHOW;
        this.revealTile(nearByTile);
      });
    } else {
      tile.text = mineCount.toString();
    }
  };
  getNearByTiles = (tile: ITile) => {
    const tileList: ITile[] = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const nearByTile = this.board[tile.x + xOffset]?.[tile.y + yOffset];
        if (
          nearByTile &&
          nearByTile.status !== SHOW &&
          (nearByTile.x !== tile.x || nearByTile.y !== tile.y)
        ) {
          tileList.push(nearByTile);
        }
      }
    }
    return tileList;
  };
  positionMatch = (a: IPosition, b: IPosition) => a.x === b.x && a.y === b.y;
  generateRandomNumber = (range: number) => Math.floor(Math.random() * range);
}
const store = new BoardStore();
export default store;
