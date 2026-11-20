// One element, many box-shadows: cheaper than a div per star. Deterministic, so the
// server and the client render the same thing without runtime animations.
const SHADOW = Array.from({ length: 76 }, (_, index) => {
  const seed = (index + 1) * 9301;
  const x = ((seed * 7919) % 1000) / 10;
  const y = ((seed * 104729) % 1000) / 10;
  const size = index % 9 === 0 ? 1 : 0;
  const opacity = (0.22 + ((index * 37) % 52) / 100).toFixed(2);
  const tint =
    index % 11 === 0
      ? '56 189 248' // Precision Sky-Cyan glint
      : index % 5 === 0
        ? '129 140 248' // Atlas Indigo-Cobalt glint
        : '226 232 240'; // Crisp cool starlight
  return `${x}vw ${y}vh 0 ${size}px rgb(${tint} / ${opacity})`;
}).join(',');

export function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="absolute top-0 left-0 size-px rounded-full" style={{ boxShadow: SHADOW }} />
    </div>
  );
}
