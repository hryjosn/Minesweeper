import classnames from "classnames";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { MouseEvent, useEffect, useRef } from "react";
import BoardStore from "../store/BoardStore";
import { ITile, TILE_STATUS } from "./type";

const Board = () => {
  const {
    board,
    time,
    setMinePositions,
    mineList,
    onClick,
    gameStatus,
    markedNumber,
    onDoubleClick,
    start,
    mineCount,
    width,
    height,
  } = BoardStore;

  const { SHOW, HIDDEN, MARKED } = TILE_STATUS;
  const intervalRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartGame = () => {
    start();
    clearInterval(intervalRef.current);

    const id = setInterval(() => {
      if (BoardStore.time < 999 && !BoardStore.gameStatus) {
        runInAction(() => {
          BoardStore.time = BoardStore.time + 1;
        });
      } else {
        clearInterval(intervalRef.current);
        runInAction(() => {
          BoardStore.gameStatus = "lose";
        });
      }
    }, 1000);
    intervalRef.current = id;
  };

  const handleTileRightClick = (
    e: MouseEvent<HTMLTableCellElement, globalThis.MouseEvent>,
    tile: ITile,
  ) => {
    e.preventDefault();

    if (gameStatus) {
      e.stopPropagation();
      return;
    }

    runInAction(() => {
      if (tile.status === MARKED) {
        tile.status = HIDDEN;
      } else {
        if (tile.status === HIDDEN && markedNumber < Number(mineCount)) {
          tile.status = MARKED;
        }
      }
    });
  };

  const handleTileClick = (
    e: MouseEvent<HTMLTableCellElement, globalThis.MouseEvent>,
    tile: ITile,
  ) => {
    if (gameStatus) {
      e.stopPropagation();
      return;
    }
    if (mineList.length === 0) {
      setMinePositions(tile);
    }
    if (tile.status !== MARKED) {
      runInAction(() => {
        tile.status = SHOW;
      });
      onClick(tile);
    }
  };

  return (
    <div className="text-center">
      <div className="text-3xl">{gameStatus}</div>
      <h1>Mine Left: {Number(mineCount) - markedNumber}</h1>
      <div className="flex justify-center gap-5">
        <div>
          <label>Mines: </label>
          <input
            className="border border-black"
            placeholder="Mines"
            value={mineCount}
            onChange={(e) => {
              BoardStore.mineCount = e.target.value;
            }}
          />
        </div>
        <div>
          <label>Width: </label>
          <input
            className="border border-black"
            placeholder="Width"
            value={width}
            onChange={(e) => {
              BoardStore.width = e.target.value;
            }}
          />
        </div>
        <div>
          <label>Height: </label>
          <input
            className="border border-black"
            placeholder="Height"
            value={height}
            onChange={(e) => {
              BoardStore.height = e.target.value;
            }}
          />
        </div>
      </div>
      <button
        className="border bg-zinc-200 border-black px-2 py-1 rounded my-5"
        onClick={handleStartGame}
      >
        {board.length ? "Restart" : "Start"}
      </button>
      <div className="text-3xl">Time: {time}</div>
      <div className="flex justify-center">
        <table>
          <tbody>
            {board.map((row, rowIndex) => (
              <tr className="flex-row" key={`row_${rowIndex}`}>
                {row.map((tile) => (
                  <td
                    key={`${tile.x}_${tile.y}`}
                    className={classnames(
                      "border border-black w-10 h-10 cursor-pointer text-center text-white text-2xl",
                      {
                        "bg-zinc-300": tile.status === HIDDEN,
                      },
                      {
                        "bg-zinc-500": !tile.isMine && tile.status === SHOW,
                      },
                      {
                        "bg-red-600": tile.isMine && tile.status === SHOW,
                      },
                      {
                        "bg-yellow-500": tile.status === MARKED,
                      },
                      {
                        "bg-purple-500":
                          gameStatus === "lose" &&
                          tile.isMine &&
                          tile.status === MARKED,
                      },
                    )}
                    onDoubleClick={() => {
                      onDoubleClick(tile);
                    }}
                    onContextMenu={(e) => handleTileRightClick(e, tile)}
                    onClick={(e) => handleTileClick(e, tile)}
                  >
                    {!tile.isMine && tile.status !== MARKED && tile.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default observer(Board);
