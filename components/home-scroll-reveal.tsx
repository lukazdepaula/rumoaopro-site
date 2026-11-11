"use client";
import {useEffect,useRef,type ReactNode} from "react";
import styles from "./home-services.module.css";

export function HomeScrollReveal({children}:{children:ReactNode}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=ref.current;
    if(!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !('IntersectionObserver' in window)) return;
    // Keep initial and no-JS content visible; only reveal sections below the fold.
    if(node.getBoundingClientRect().top<window.innerHeight) return;
    node.dataset.reveal="pending";
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){node.dataset.reveal="visible";observer.disconnect();}},{rootMargin:"0px 0px 80px 0px",threshold:0});
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);
  return <div ref={ref} className={styles.reveal}>{children}</div>;
}
