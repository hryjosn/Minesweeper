import { makeAutoObservable } from "mobx";
import { IPosition, ITile, TILE_STATUS } from "../components/type";
const { SHOW, HIDDEN, MARKED } = TILE_STATUS;

class BoardStore {
  board: ITile[][] = [];
  mineCount = "10";
  width = "20";
  height = "20";
  time = 0;
  mineList: IPosition[] = [];
  gameStatus: "lose" | "win" | "" = "";
  constructor() {
    makeAutoObservable(this);
  }
  setUp = (): void => {
    const width = Number(this.width);
    const height = Number(this.height);
    for (let i = 0; i < width; i++) {
      const row = [];
      for (let j = 0; j < height; j++) {
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
  start = (): void => {
    this.board = [];
    this.mineList = [];
    this.gameStatus = "";
    this.time = 0;
    this.setUp();
  };
  onDoubleClick = (tile: ITile): void => {
    const nearByTileList = this.getNearByTiles(tile);
    if (
      nearByTileList.filter((tile) => tile.status === MARKED).length ===
      Number(tile.text)
    ) {
      nearByTileList.forEach((nearByTile) => {
        if (nearByTile.status !== MARKED) {
          this.onClick(nearByTile);
        }
      });
    }
  };
  countMineNumber = (tileList: ITile[]): number =>
    tileList.filter((tile) => tile.isMine).length;
  setMinePositions = (tile: ITile): void => {
    const width = Number(this.width);
    const height = Number(this.height);
    const numberOfMines = Number(this.mineCount);

    while (this.mineList.length < numberOfMines) {
      const x = this.generateRandomNumber(width);
      const y = this.generateRandomNumber(height);
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
      this.gameStatus = "lose";
      this.showResult();
    } else {
      clickedTile.status = SHOW;
      if (this.checkWin()) {
        this.gameStatus = "win";
        this.board.forEach((row) => {
          row.forEach((tile) => {
            if (tile.isMine && tile.status !== MARKED) tile.status = MARKED;
          });
        });
      }
    }
  };
  get markedNumber(): number {
    return this.board.reduce(
      (acc, cur) => cur.filter((tile) => tile.status === MARKED).length + acc,
      0,
    );
  }
  showResult = () => {
    this.board.forEach((row) => {
      row.forEach((tile) => {
        if (tile.isMine && tile.status !== MARKED) tile.status = SHOW;
      });
    });
  };

  checkWin = () => {
    return this.board.every((row) =>
      row.every(
        (tile) => (tile.isMine && tile.status !== SHOW) || tile.status === SHOW,
      ),
    );
  };

  revealTile = (tile: ITile) => {
    if (tile.isMine) {
      return;
    }
    const nearByTileList = this.getNearByTiles(tile);
    const mineCount = this.countMineNumber(nearByTileList);
    if (mineCount === 0) {
      nearByTileList.forEach((nearByTile) => {
        if (nearByTile.status === HIDDEN) {
          nearByTile.status = SHOW;
        }
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
          nearByTile?.status !== SHOW &&
          !this.positionMatch(nearByTile, tile)
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
