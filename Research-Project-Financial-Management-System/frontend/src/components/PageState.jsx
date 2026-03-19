// Reusable loading spinner and error message components

export const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

export const ErrorMsg = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="text-rose-400 text-sm">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);