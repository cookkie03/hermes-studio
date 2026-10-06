export const characters = ['blue', 'mint', 'orange', 'purple'] as const;
export type Character = typeof characters[number];

/** Stable identity keeps each specialist recognizable across views and reloads. */
export function characterFor(identity?: string): Character {
  if (!identity) return characters[0];
  if (characters.includes(identity as any)) return identity as Character;
  let hash = 0;
  for (const character of identity)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return characters[hash % characters.length];
}

export function Mascot({
  state = 'idle',
  small = false,
  identity,
  avatarId,
  name = 'Dot',
  decorative = false,
}: {
  state?: string;
  small?: boolean;
  identity?: string;
  avatarId?: string;
  name?: string;
  decorative?: boolean;
}) {
  const chosen = avatarId && characters.includes(avatarId as any) ? (avatarId as Character) : characterFor(identity);
  return (
    <span className={`mascot ${state} ${small ? 'small' : ''}`}>
      <img
        className="dot-body"
        src={`/dots/${chosen}.png`}
        alt={decorative ? '' : `${name} is ${state}`}
        width={512}
        height={512}
        draggable={false}
      />
    </span>
  );
}
