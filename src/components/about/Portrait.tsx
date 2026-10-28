import Image from "next/image";

type PortraitProps = {
  name: string;
  photoUrl: string | null;
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Portrait({ name, photoUrl }: PortraitProps) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-panel border border-line bg-surface-solid">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`Portrait of ${name}`}
          fill
          sizes="(min-width: 960px) 420px, 100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div
          role="img"
          aria-label={`${name} monogram`}
          className="absolute inset-0 grid place-items-center bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:40px_40px]"
        >
          <span
            aria-hidden="true"
            className="text-gradient font-display text-[clamp(5rem,18vw,10rem)] leading-none"
          >
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
