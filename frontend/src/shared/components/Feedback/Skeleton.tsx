type SkeletonProps = {
  count?: number;
  height?: number;
  width?: string | number;
  radius?: string;
  className?: string;
};

const Skeleton = ({
  count = 1,
  height = 16,
  width = "100%",
  radius = "0.75rem",
  className = "",
}: SkeletonProps) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-full bg-slate-200/70"
        style={{ height, width, borderRadius: radius }}
      />
    ))}
  </div>
);

export default Skeleton;
