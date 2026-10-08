type CartIconProps = { className?: string };

export function CartIcon({ className }: CartIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M5.25 13.25h21.5l-1.83 11.72a2.25 2.25 0 0 1-2.22 1.9H9.3a2.25 2.25 0 0 1-2.22-1.9L5.25 13.25Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m10.25 13.25 3.09-7.15a2.9 2.9 0 0 1 5.32 0l3.09 7.15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12.25 18.35v4.65m3.75-4.65v4.65m3.75-4.65v4.65" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}
