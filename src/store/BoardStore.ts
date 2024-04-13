import { makeAutoObservable } from "mobx";
import { IPosition, ITile, TILE_STATUS } from "../components/type";

// Destructuring TILE_STATUS object for easier access
const { SHOW, HIDDEN, MARKED } = TILE_STATUS;

// Define the BoardStore class
class BoardStore {
  // Initialize state variables
  board: ITile[][] = [];
  mineCount = "10";
  width = "20";
  height = "20";
  time = 0;
  mineList: IPosition[] = [];
  gameStatus: "lose" | "win" | "" = "";

  // Constructor to make the class observable
  constructor() {
    makeAutoObservable(this);
  }

  // Method to set up the game board
  setUp = (): void => {
    const width = Number(this.width);
    const height = Number(this.height);
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
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

  // Method to start a new game
  start = (): void => {
    this.board = [];
    this.mineList = [];
    this.gameStatus = "";
    this.time = 0;
    this.setUp();
  };

  // Method to handle double-click events on tiles
  onDoubleClick = (tile: ITile): void => {
    if (tile.text) {
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
    }
  };

  // Method to randomly place mines on the board
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

  // Method to handle left click events on tiles
  onClick = (clickedTile: ITile) => {
    if (clickedTile.isMine) {
      this.gameStatus = "lose";
      this.showResult();
    } else {
      clickedTile.status = SHOW;
      this.revealTile(clickedTile);
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

  // Method to reveal the results of the game
  showResult = () => {
    this.board.forEach((row) => {
      row.forEach((tile) => {
        if (tile.isMine && tile.status !== MARKED) tile.status = SHOW;
      });
    });
  };

  // Method to check if the player has won the game
  checkWin = () => {
    return this.board.every((row) =>
      row.every(
        (tile) => (tile.isMine && tile.status !== SHOW) || tile.status === SHOW,
      ),
    );
  };

  // Method to reveal tiles and their neighbors recursively
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

  // Method to get neighboring tiles of a given tile
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

  // Method to check if two positions match
  positionMatch = (a: IPosition, b: IPosition) => a.x === b.x && a.y === b.y;

  // Method to generate a random number within a specified range
  generateRandomNumber = (range: number) => Math.floor(Math.random() * range);

  // Method to count the number of mines around a tile
  countMineNumber = (tileList: ITile[]): number =>
    tileList.filter((tile) => tile.isMine).length;
  // Computed property to get the number of tiles marked as mines
  get markedNumber(): number {
    return this.board.reduce(
      (acc, cur) => cur.filter((tile) => tile.status === MARKED).length + acc,
      0,
    );
  }
}

const store = new BoardStore();

export default store;
