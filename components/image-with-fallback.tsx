"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type ImageWithFallbackProps = Omit<ImageProps, "onError"> & {
  fallbackSrc: string;
};

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }

        console.error("Handled image load error:", event);
      }}
    />
  );
}
