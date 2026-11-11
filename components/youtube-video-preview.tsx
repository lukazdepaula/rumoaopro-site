"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import styles from "./youtube-video-preview.module.css";

export function YouTubeVideoPreview({ videoId, poster, title, locale }: {
  videoId: string; poster: string; title: string; locale: "pt" | "en";
}) {
  const [playing, setPlaying] = useState(false);
  const pt = locale === "pt";
  return <div className={styles.preview}>
    {playing ? <iframe
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    /> : <button
      type="button"
      className="focus-ring"
      aria-label={`${pt ? "Reproduzir vídeo" : "Play video"}: ${title}`}
      onClick={() => setPlaying(true)}
    >
      <Image src={poster} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" />
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.play} aria-hidden="true"><Play size={26} fill="currentColor" /></span>
      <span className={styles.caption}>{pt ? "ASSISTIR À APRESENTAÇÃO" : "WATCH THE INTRODUCTION"}<strong>{title}</strong></span>
    </button>}
  </div>;
}
