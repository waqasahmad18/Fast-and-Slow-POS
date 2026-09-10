"use client";

import { useState } from "react";
import { dishImage, PLACEHOLDER_DISH } from "@/lib/dishes";

export function DishPhoto({
  item,
  alt,
  className = "h-full w-full object-cover",
}: {
  item: { id?: string; name?: string; image?: string };
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={broken ? PLACEHOLDER_DISH : dishImage(item)}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
