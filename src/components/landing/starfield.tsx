// One element, many box-shadows: cheaper than a div per star. Deterministic, so the
// server and the client render the same thing.
const SHADOW = Array.from({ length: 70 }, (_, index) => {
  const seed = (index + 1) * 9301;
  const x = ((seed * 7919) % 1000) / 10;
  const y = ((seed * 104729) % 1000) / 10;
  const size = index % 7 === 0 ? 1 : 0;
  const opacity = (0.3 + ((index * 37) % 60) / 100).toFixed(2);
  return `${x}vw ${y}vh 0 ${size}px rgb(255 255 255 / ${opacity})`;
}).join(',');

export function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="absolute top-0 left-0 size-px rounded-full" style={{ boxShadow: SHADOW }} />
    </div>
  );
}
