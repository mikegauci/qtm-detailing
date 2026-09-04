export function EditorLoading({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
      Loading {label}…
    </div>
  );
}
