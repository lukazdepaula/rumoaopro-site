import Image from "next/image";
import styles from "./home-services.module.css";

export function HomeCourseLaptop({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  return (
    <figure className={styles.courseLaptop}>
      <div className={styles.laptopAssembly}>
        <div className={styles.laptopFrame}>
          <span className={styles.laptopCamera} aria-hidden="true" />
          <div className={styles.laptopToolbar} aria-hidden="true">
            <span><i /><i /><i /></span>
            <strong>PREPARADOR <b>PRO</b></strong>
            <small>{pt ? "SALA DE AULA" : "CLASSROOM"}</small>
          </div>
          <Image
            src="/assets/courses/preparador-pro/screens/lesson-player.webp"
            alt={pt ? "Tela completa de uma aula do Preparador Pro, com vídeo e lista de módulos" : "Complete Preparador Pro lesson screen, including the video and module list"}
            width={1600}
            height={842}
            sizes="(min-width: 1280px) 530px, (min-width: 768px) 42vw, 85vw"
            quality={90}
            className={styles.courseImage}
          />
        </div>
        <div className={styles.laptopBase} aria-hidden="true">
          <div className={styles.laptopKeys} />
          <div className={styles.laptopTrackpad} />
          <span />
        </div>
      </div>
      <figcaption className={styles.visualCaption}>
        <small>{pt ? "PREPARADOR PRO · FORMAÇÃO EM PORTUGUÊS" : "PREPARADOR PRO · TAUGHT IN PORTUGUESE"}</small>
        <strong>{pt ? "Da aula para o treino." : "From the lesson to training."}</strong>
      </figcaption>
    </figure>
  );
}
