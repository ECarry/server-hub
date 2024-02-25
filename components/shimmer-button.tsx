interface ShimmerButtonProps {
  label: string;
}
const ShimmerButton = ({ label }: ShimmerButtonProps) => {
  return (
    <button
      type="button"
      className="
      flex
      gap-2
      items-center
      py-3
      px-4
      rounded-full
      bg-[conic-gradient(from_var(--shimmer-angle),white_0%,theme(colors.slate.950)_10%,white_20%)]
      dark:bg-[conic-gradient(from_var(--shimmer-angle),theme(colors.slate.950)_0%,theme(colors.slate.500)_10%,theme(colors.slate.950)_20%)]
      animate-[shimmer_3s_linear_infinite]
      relative
      after:absolute
      after:flex
      after:items-center
      after:justify-center
      after:text-primary
      after:text-sm
      after:inset-[2px]
      after:rounded-full
      after:bg-gray-50
      dark:after:bg-black
      after:content-[attr(aria-label)]
      "
      aria-label={label}
    >
      <p className="opacity-0">{label}</p>
    </button>
  );
};

export default ShimmerButton;
