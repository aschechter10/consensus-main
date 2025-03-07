import { useModal } from "@/context/ModalContext";
import { CaretLeft, CaretRight, Circle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import Modal from "./ui/Modal";
import clsx from "clsx";

export default function HowToPlay() {
  const MAX_PAGE = 1;
  const [page, setPage] = useState(0);
  const { closeModal } = useModal();

  const seasons = [
    { name: "Spring", color: "bg-gameBlue" },
    { name: "Summer", color: "bg-gameYellow" },
    { name: "Winter", color: "bg-gameGreen" },
    { name: "Fall", color: "bg-gameRed" }
  ]

  const [filledIndexes, setFilledIndexes] = useState<number[]>([]);
  const [shuffledSeasons, setShuffledSeasons] = useState(() =>
    [...seasons].sort(() => Math.random() - 0.5)
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (page !== MAX_PAGE) {
      setFilledIndexes([]);
      setHighlightedIndex(null);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleBack = () => {
    if (page !== 0) {
      setFilledIndexes([]);
      setHighlightedIndex(null);
      setPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    if (page === 0) {
      const interval = setInterval(() => {
        if (filledIndexes.length < 4) {
          setFilledIndexes((prev) => [...prev, prev.length]);
        } else {
          setFilledIndexes([]);
          setShuffledSeasons([...seasons].sort(() => Math.random() - 0.5));
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        if (filledIndexes.length < 4) {
          const remainingIndexes = [0, 1, 2, 3].filter(
            (i) => !filledIndexes.includes(i)
          );
          const nextIndex =
            remainingIndexes[
              Math.floor(Math.random() * remainingIndexes.length)
            ];
          setHighlightedIndex(nextIndex);

          setTimeout(() => {
            setHighlightedIndex(null);
            setFilledIndexes((prev) => [...prev, nextIndex]);
          }, 500);
        } else {
          setFilledIndexes([]);
          setShuffledSeasons([...seasons].sort(() => Math.random() - 0.5));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [filledIndexes]);

  return (
    <Modal title="How to Play" onClose={closeModal} className="w-full max-w-lg">
      {page === 0 ? (
        <div>
          <div className="flex flex-col gap-2 px-20 py-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={clsx(
                  "p-2 h-9 flex items-center justify-center text-center uppercase text-black font-bold rounded transition-all duration-500",
                  filledIndexes.includes(index) ? shuffledSeasons[index].color : "bg-transparent border-2",
                )}
              >
                {filledIndexes.includes(index) ? shuffledSeasons[index].name : ""}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold">Welcome to Consensus!</p>
            <ul className="list-disc pl-5">
              <li className="my-1">
                Each day brings four new words that fall into a common category.
              </li>
              <li className="my-1">
                {"It's up to you to rank them however you want."}
              </li>
              <li className="my-1">
                {
                  "Once you've submitted your ranking, you'll be able to see how yours matches up to the Consensus, the most common ranking among everyone who's played today."
                }
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 px-20 py-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={clsx(
                  "p-2 h-9 flex items-center justify-center text-center uppercase text-black font-bold rounded transition-all duration-500",
                  filledIndexes.includes(index) ? shuffledSeasons[index].color : "bg-transparent border-2",
                  highlightedIndex === index ? "bg-white/50" : ""
                )}
              >
                {filledIndexes.includes(index) ? shuffledSeasons[index].name : ""}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold">Controls</p>
            <ul className="list-disc pl-5">
              <li className="my-1">
                Clicking an unranked tile sends it to the highest available
                space in your ranking.
              </li>
              <li className="my-1">
                Or you can click on a destination first, then select a tile to
                send it there.
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="flex justify-between mt-8">
        <Button disabled={page === 0} variant="secondary" onClick={handleBack}>
          <CaretLeft />
          Back
        </Button>
        <div className="flex justify-center items-center gap-1">
          <Circle size={12} weight="fill" />
          <Circle
            size={12}
            weight={page === 1 ? "fill" : "regular"}
            className="transition-all"
          />
        </div>
        {page === MAX_PAGE ? (
          <Button onClick={closeModal}>Close</Button>
        ) : (
          <Button onClick={handleNext}>
            Next <CaretRight />
          </Button>
        )}
      </div>
    </Modal>
  );
}