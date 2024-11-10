import { useRef } from "react";

export const Input = () => {
  const ref = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      window.API.hideInput();
      return;
    }
    if (e.metaKey && e.key === "Enter") {
      window.API.openMain();
      return;
    }

    if (e.key === "Enter") {
      const value = ref.current.value;

      await window.API.createTask(value);
      window.API.update();

      ref.current.value = "";
      return;
    }
  };

  return (
    <div className="bg-neutral-900 h-[100dvh] text-neutral-100 place-content-center gap-2 border rounded-full border-neutral-600 px-6">
      <input
        ref={ref}
        autoFocus
        onKeyDown={handleKeyDown}
        className="bg-transparent focus-visible:outline-none w-full"
        placeholder="todo..."
      />
    </div>
  );
};
