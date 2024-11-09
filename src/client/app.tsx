import { useState } from "react";

export const App = () => {
  const [counter, setCounter] = useState(0);
  return (
    <div className="bg-neutral-900 h-[100dvh] grid place-items-center text-neutral-100 place-content-center gap-2">
      <p>{counter}</p>
      <button
        className="min-w-[60px] text-sm border border-neutral-500 h-8 rounded"
        onClick={() => setCounter((c) => c + 1)}
      >
        +
      </button>
    </div>
  );
};
