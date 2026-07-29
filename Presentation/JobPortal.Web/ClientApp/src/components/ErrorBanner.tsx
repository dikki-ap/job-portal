export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold text-red-600">{message}</p>
      <p className="text-sm text-gray-500">Please refresh the page or try again later.</p>
    </div>
  );
}
