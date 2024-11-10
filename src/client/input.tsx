export const Input = () => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      window.API.hideInput();
      return;
    }
    if (e.metaKey && e.key === "Enter") {
      window.API.openMain();
      return;
    }
  };

  return (
    <div className="bg-neutral-900 h-[100dvh] text-neutral-100 place-content-center gap-2 border rounded-full border-neutral-600 px-6">
      <input
        autoFocus
        onKeyDown={handleKeyDown}
        className="bg-transparent focus-visible:outline-none w-full"
        placeholder="todo..."
      />
    </div>
  );
};
