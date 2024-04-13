import classnames from "classnames/dedupe";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import BoardStore from "../store/BoardStore";
import { TILE_STATUS } from "./type";

const Board = () => {
  const {
    board,

    setMinePositions,
    mineList,
    onClick,
    gameStatus,
    checkWin,
    onDoubleClick,
    start,
  } = BoardStore;
  const NUMBER_OF_MINES = 30;
  const BOARD_SIZE = 20;
  const [time, setTime] = useState(0);
  const { SHOW, HIDDEN, MARKED } = TILE_STATUS;
  const intervalRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    const id = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    intervalRef.current = id;
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="text-center">
      <h1>{gameStatus}</h1>
      <h1>
        Mine Left:{" "}
        {NUMBER_OF_MINES -
          (board.reduce(
            (acc, cur) =>
              cur.filter((tile) => tile.status === MARKED).length + acc,
            0,
          ),
          0)}
      </h1>
      <button
        className="border bg-zinc-200 border-black px-2 py-1 rounded mb-5"
        onClick={() => {
          start({ size: BOARD_SIZE });
        }}
      >
        {board.length ? "Restart" : "Start"}
      </button>
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
                        gameStatus && tile.isMine && tile.status === MARKED,
                    },
                  )}
                  onDoubleClick={() => {
                    onDoubleClick(tile);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    runInAction(() => {
                      if (tile.status === MARKED) {
                        tile.status = HIDDEN;
                      } else {
                        if (tile.status === HIDDEN) {
                          tile.status = MARKED;
                        }
                      }
                      if (checkWin()) {
                        BoardStore.gameStatus = "You win";
                      }
                    });
                  }}
                  onClick={(e) => {
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    if (mineList.length === 0) {
                      setMinePositions(BOARD_SIZE, NUMBER_OF_MINES, tile);
                      console.log("mineList>", mineList);
                    }
                    if (tile.status !== MARKED) {
                      runInAction(() => {
                        tile.status = SHOW;
                      });
                      onClick(tile);
                    }
                  }}
                >
                  {!tile.isMine && tile.status !== MARKED && tile.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default observer(Board);
