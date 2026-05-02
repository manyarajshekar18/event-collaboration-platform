export default function Spinner({ size = "md" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-[3px] border-brand-500 border-t-gold rounded-full animate-spin`}
      />
    </div>
  );
}
