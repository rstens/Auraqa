/**
 * UserAvatar — renders a user's avatar with a graceful initials fallback.
 *
 * Sizes follow Tailwind's `h-N w-N` scale. Falls back to a blue circle with
 * the first letter of `name` (or "U") if no `image` is set.
 *
 * Consolidates duplicated image/initials code that was inlined in UserMenu
 * and the profile page.
 */

import Image from "next/image";

const sizes = {
  sm: { box: "h-8 w-8", text: "text-sm", px: 32 },
  md: { box: "h-12 w-12", text: "text-lg", px: 48 },
  lg: { box: "h-16 w-16", text: "text-2xl", px: 64 },
} as const;

export type UserAvatarSize = keyof typeof sizes;

export function UserAvatar({
  src,
  name,
  size = "sm",
  alt,
}: {
  src?: string | null;
  name?: string | null;
  size?: UserAvatarSize;
  alt?: string;
}) {
  const { box, text, px } = sizes[size];
  const displayName = name ?? "U";

  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? displayName}
        width={px}
        height={px}
        className={`${box} rounded-full`}
      />
    );
  }

  return (
    <div
      className={`${box} ${text} flex items-center justify-center rounded-full bg-blue-600 font-medium text-white`}
      aria-label={alt ?? displayName}
    >
      {displayName[0]!.toUpperCase()}
    </div>
  );
}
