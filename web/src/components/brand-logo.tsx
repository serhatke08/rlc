import Image from "next/image";
import Link from "next/link";

import { APP_LOGO_PATH, APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIZE_PX = {
  sm: 40,
  md: 48,
  lg: 64,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZE_PX;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = "md",
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const px = SIZE_PX[size];
  const image = (
    <Image
      src={APP_LOGO_PATH}
      alt={APP_NAME}
      width={px}
      height={px}
      priority={priority}
      className={cn("rounded-xl object-cover", className)}
      style={{ width: px, height: px }}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0" aria-label={APP_NAME}>
      {image}
    </Link>
  );
}
