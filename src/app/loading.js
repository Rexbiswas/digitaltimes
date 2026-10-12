export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#E8DFC8] text-[#201E19] flex items-center justify-center font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#9F3028] animate-ping" />
        <span>LOADING THE DIGITAL TIMES...</span>
      </div>
    </div>
  );
}
