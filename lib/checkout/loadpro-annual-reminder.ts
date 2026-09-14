import type { LoadProBillingAccess } from './loadpro';
import { ANNUAL_PLANS, type AnnualPlanCode } from './loadpro-annual-policy';

// Pure preparation only: no sender, scheduler, contacts API, or production mail.
// The caller must re-read access/preferences just before any future approved send.
export function prepareAnnualTrialReminder(access:LoadProBillingAccess, options:{
  now?:number; locale?:'pt'|'en'; offerConsent:boolean; suppressed:boolean;
  deliveredKeys:ReadonlySet<string>; appUrl:string;
}) {
  const now=options.now ?? Date.now();
  const meta=access.metadata;
  const plan=ANNUAL_PLANS[access.plan_code as AnnualPlanCode];
  const start=typeof meta.trial_start==='number' ? meta.trial_start*1000 : Date.parse(String(meta.trial_start || ''));
  const end=typeof meta.trial_end==='number' ? meta.trial_end*1000 : Date.parse(String(meta.trial_end || ''));
  const left=end-now;
  const key=`loadpro:trial-ending:v1:${access.id}:${end}`;
  if (!options.offerConsent || options.suppressed || options.deliveredKeys.has(key)
    || !plan || access.currency!=='BRL' || access.price_cents!==plan.monthlyCents
    || !access.user_id || access.access_kind==='lifetime' || meta.provider_subscription_status!=='trialing'
    || meta.cancel_at_period_end===true || meta.annual_change || meta.billing_interval==='year'
    || !Number.isFinite(start) || !Number.isFinite(end) || end-start>8*86400000
    || left<=0 || left>48*3600000) return null;
  const link=new URL('/?view=setup&settings=security',options.appUrl);
  if (link.protocol!=='https:' && !['localhost','127.0.0.1'].includes(link.hostname)) throw new Error('Invalid subscription URL');
  const en=options.locale==='en';
  const money=(cents:number)=>new Intl.NumberFormat(en?'en-GB':'pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
  const monthly=money(plan.monthlyCents), annual=String(plan.annualCents/100), saving=money(plan.monthlyCents*12-plan.annualCents);
  link.searchParams.set('lang',en?'en':'pt');
  const date=new Intl.DateTimeFormat(en?'en-GB':'pt-BR',{dateStyle:'long',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(end));
  return { idempotencyKey:key, to:access.email,
    subject:en?'Your LoadPro trial ends soon':'Seu teste do LoadPro está terminando',
    text:en
      ? `Your seven-day trial ends on ${date} (São Paulo time). Your current monthly subscription is scheduled to charge R$${monthly} on that date. You can keep it or choose the same plan for R$${annual}/year, paid in full: 12 months for the price of 10, saving R$${saving} per year. Card: annual charge at trial end with automatic yearly renewal. Pix: payment in full now, manual renewal, and 12 months added after your remaining free days only after provider confirmation. Review the amount, dates and transition in your account: ${link}. Nothing changes without your explicit confirmation.`
      : `Seu teste de sete dias termina em ${date} (horário de Brasília). A cobrança prevista da sua assinatura mensal é de R$ ${monthly} nessa data. Você pode manter o mensal ou escolher o mesmo plano por R$ ${annual}/ano, pago à vista: 12 meses pelo preço de 10. Economize R$ ${saving} por ano. No cartão, a cobrança anual ocorre no fim do teste, com renovação automática anual. No Pix, o pagamento é à vista agora, a renovação é manual e os 12 meses são acrescentados após os dias grátis restantes, somente com a confirmação do provedor. Confira valor, datas e transição na sua conta: ${link}. Nada muda sem sua confirmação explícita.`
  };
}
