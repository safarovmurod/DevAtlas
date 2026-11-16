/** Community chat limits shared by the API and the browser. The database enforces them too. */
export const COMMUNITY_BUCKET = 'community-media';
export const COMMUNITY_TEXT_MAX = 2000;
export const COMMUNITY_CODE_MAX = 8000;
export const COMMUNITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const COMMUNITY_VIDEO_MAX_BYTES = 25 * 1024 * 1024;

export const COMMUNITY_MEDIA_TYPES = {
  'image/jpeg': { kind: 'image', ext: 'jpg' },
  'image/png': { kind: 'image', ext: 'png' },
  'image/webp': { kind: 'image', ext: 'webp' },
  'video/mp4': { kind: 'video', ext: 'mp4' },
  'video/webm': { kind: 'video', ext: 'webm' },
} as const;
export type CommunityMediaType = keyof typeof COMMUNITY_MEDIA_TYPES;

export function isCommunityMediaType(value: string): value is CommunityMediaType {
  return Object.hasOwn(COMMUNITY_MEDIA_TYPES, value);
}

/** null when the file may be uploaded, otherwise the reason. */
export function communityMediaProblem(type: string, size: number): 'type' | 'size' | null {
  if (!isCommunityMediaType(type)) return 'type';
  const max =
    COMMUNITY_MEDIA_TYPES[type].kind === 'image'
      ? COMMUNITY_IMAGE_MAX_BYTES
      : COMMUNITY_VIDEO_MAX_BYTES;
  return Number.isInteger(size) && size > 0 && size <= max ? null : 'size';
}
