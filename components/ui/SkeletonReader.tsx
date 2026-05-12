// components/ui/SkeletonReader.tsx
export default function SkeletonReader() {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 animate-pulse">
      <div className="h-4 w-32 bg-border-base/50 rounded mb-6" />
      <div className="h-12 w-full bg-border-base/50 rounded-xl mb-4" />
      <div className="h-12 w-3/4 bg-border-base/50 rounded-xl mb-12" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-border-base/30 rounded" />
        <div className="h-4 w-full bg-border-base/30 rounded" />
        <div className="h-4 w-5/6 bg-border-base/30 rounded" />
      </div>
    </div>
  );
}