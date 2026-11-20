import { AtlasLoader3D, type AtlasLoaderSize } from './atlas-loader-3d';

export function LoadingState({ label, size = 'sm' }: { label: string; size?: AtlasLoaderSize }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <AtlasLoader3D size={size} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="loading-placeholder" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
