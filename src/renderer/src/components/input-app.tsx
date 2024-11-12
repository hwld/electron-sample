import { useRef } from "react";

function InputApp(): JSX.Element {
  const ref = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === "Escape") {
      window.api.hideInput();
      return;
    }
    if (e.metaKey && e.key === "Enter") {
      window.api.openMain();
      return;
    }

    if (ref.current && e.key === "Enter") {
      const value = ref.current.value;

      await window.api.createTask(value);
      window.api.update();

      ref.current.value = "";
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
}

export default InputApp;
