import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight, Layers3 } from "lucide-react";
import { assets } from "@/lib/content";
import styles from "./home-services.module.css";

export function HomeServicesEntry({ locale }: { locale:"pt"|"en" }) {
  const pt=locale==="pt";
  const services = [
    { id:"programs", name:pt?"Programas de treino":"Training programs", audience:pt?"PARA ATLETAS":"FOR PLAYERS", body:pt?"Escolha seu objetivo. Siga o plano.":"Choose your goal. Follow the plan.", href:pt?"/programas":"/en/programs", image:"/assets/photos/programs/programs-field-control.jpg", position:"52% 30%", tag:"01" },
    { id:"coaching", name:pt?"Assessoria online":"Online coaching", audience:pt?"ACOMPANHAMENTO INDIVIDUAL":"INDIVIDUAL SUPPORT", body:pt?"Um planejamento que acompanha você.":"A training plan that moves with you.", href:pt?"/assessoria":"/en/coaching", image:assets.coachFieldDrillWide, position:"30% 55%", tag:"02" },
    { id:"course", name:"Preparador Pro", audience:pt?"FORMAÇÃO PARA TREINADORES":"COACH EDUCATION", body:pt?"Da teoria à rotina no campo.":"From theory to the training pitch.", href:pt?"/cursos":"/en/courses", image:assets.programsGymBriefing, position:"50% 36%", tag:"03" },
    { id:"loadpro", name:"LoadPro", audience:pt?"GESTÃO PARA TREINADORES":"TOOLS FOR COACHES", body:pt?"Planeje. Acompanhe. Decida.":"Plan. Monitor. Decide.", href:pt?"/apps":"/en/apps", image:"/assets/home/service-cards-2026-11/loadpro-coach-office-v1.png", position:"50% 95%", tag:"04" }
  ];
  return <section className={styles.entry} aria-labelledby="home-title">
    <div className={styles.entryGlow} aria-hidden="true"/>
    <div className={styles.entryHeading}><div><p className={styles.eyebrow}><span/> RUMOAOPRO · {pt?"PERFORMANCE NO FUTEBOL":"FOOTBALL PERFORMANCE"}</p><h1 id="home-title">{pt?"Seu próximo nível.":"Your next level."}<span>{pt?"Encontre seu caminho.":"Find your path."}</span></h1></div><p>{pt?"Programas e assessoria para quem joga. Formação e tecnologia para quem prepara.":"Programs and coaching for players. Education and technology for coaches."}<a className="focus-ring" href="#jornada">{pt?"Conheça por dentro":"Take a closer look"}<ArrowDown size={16}/></a></p></div>
    <nav id="solucoes" className={styles.serviceCards} aria-label={pt?"Escolha uma solução RumoAoPro":"Choose a RumoAoPro service"}>
      {services.map(service=><Link href={service.href} key={service.name} className={`${styles.serviceCard} focus-ring`} data-service={service.id}>
        <Image src={service.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 50vw" quality={90} priority style={{objectPosition:service.position}}/>
        <span className={styles.cardNumber}>{service.tag}</span><span className={styles.cardArrow}><ArrowUpRight size={20}/></span>
        <span className={styles.cardCopy}><small>{service.audience}</small><strong>{service.name}</strong><span>{service.body}</span><b>{pt?"Explorar":"Explore"}<ChevronRight size={13}/></b></span>
      </Link>)}
    </nav>
    <div className={styles.entryFoot}><a href="#atletas" className={`${styles.trustLink} focus-ring`}><span className={styles.faces}>{[assets.successTheo,assets.successHaroune,assets.successGabriel].map(src=><Image src={src} alt="" key={src} width={36} height={36}/>)}</span><span>{pt?"O trabalho tem história.":"Every journey has a story."}<small>{pt?"Conheça nossos atletas e avaliações":"Meet our athletes and read their reviews"}</small></span><ArrowUpRight size={16}/></a><a href="#raptor" className={`${styles.comingLink} focus-ring`}><Layers3 size={16}/><span>Raptor Pro<small>{pt?"Próximo lançamento":"Coming next"}</small></span><ArrowDown size={13}/></a></div>
    <div className={styles.journeyStart} id="jornada"><span>{pt?"UM CAMINHO PARA CADA MOMENTO":"A PATH FOR EVERY STAGE"}</span><ArrowDown size={16}/></div>
  </section>;
}

const theoSource="https://www.cbf.com.br/selecao-brasileira/noticias/selecao-base-masculina/selecao-sub-20/do-frio-ingles-ao-calor-de-belem-matheos-ferreira-realiza-sonho-de-vestir-a-amarelinha-na-sub-20";
export function HomeAthleteStory({locale}:{locale:"pt"|"en"}) {
  const pt=locale==="pt";
  return <section id="atletas" className={styles.athleteStory} aria-labelledby="theo-story-title">
    <div className={styles.storyPhoto}><Image src={assets.successTheo} alt={pt?"Matheos Theo Ferreira com a camisa do Newcastle United":"Matheos Theo Ferreira wearing Newcastle United's shirt"} fill sizes="(min-width: 768px) 45vw, 100vw"/><span>MATHEOS “THEO” FERREIRA<small>Newcastle United</small></span></div>
    <div className={styles.storyCopy}><p className={styles.eyebrow}>{pt?"HISTÓRIAS DE QUEM TREINA COM A GENTE":"STORIES FROM OUR ATHLETES"}</p><p className={styles.selectionBadge}>{pt?"BRASIL SUB-20 · CONVOCAÇÃO EM NOVEMBRO DE 2026":"BRAZIL U20 · CALLED UP IN NOVEMBER 2026"}</p><h2 id="theo-story-title">Theo Ferreira.<br/>{pt?"Um novo capítulo.":"A new chapter."}</h2><p>{pt?"Da preparação individual de força e velocidade a novos desafios no futebol. Theo faz parte da história da RumoAoPro — e agora também foi convocado para a Seleção Brasileira Sub-20.":"From individual strength and speed preparation to new challenges in football. Theo is part of the RumoAoPro story — and has now earned a call-up to Brazil's Under-20 national team."}</p><p className={styles.storyNote}>{pt?"Uma conquista do atleta, construída com seu trabalho, sua família, seu clube e os profissionais que acompanham sua trajetória.":"An achievement built by the player, with his work, family, club and the professionals supporting his journey."}</p><div className={styles.storyActions}><Link href={pt?"/assessoria":"/en/coaching"} className="focus-ring">{pt?"Conhecer a assessoria":"Explore coaching"}<ArrowUpRight size={17}/></Link><a href={theoSource} target="_blank" rel="noopener noreferrer" className="focus-ring">{pt?"Leia a notícia na CBF":"Read the CBF story"}<ArrowUpRight size={14}/></a></div></div>
  </section>;
}
