import { AtlasLoader3D, type AtlasLoaderSize } from './atlas-loader-3d';

/** Clean 3D loading indicator with accessible screen-reader label and no boilerplate text noise. */
export function LoadingState({ label, size = 'md' }: { label: string; size?: AtlasLoaderSize }) {
  return (
    <div
      className="loading-state flex min-h-[160px] items-center justify-center py-8"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <AtlasLoader3D size={size} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
