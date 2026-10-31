import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const now=new Date().toISOString();
const products=[{id:'power_pro',name:'Power Pro',type:'training_program',active:true},
  {id:'loadpro_founders',name:'LoadPro',type:'subscription',active:true}];
const totals=(gross=0,net=gross,count=0)=>({grossRevenueBrl:gross,netRevenueBrl:net,feesBrl:gross-net,
  refundsBrl:0,paymentCount:count,transactionCount:count});
export const sources=[
  {id:'stripe',name:'Stripe',state:'ready',...totals(200,190,1),excludedTransactionCount:1,updatedAt:now,
    externalReceipts:{coaching:totals(300,285,1),internal_transfer:totals(),outgoing_payment:totals(),unclassified:totals(),hasUnconvertedCurrencies:false}},
  {id:'mercado_pago',name:'Mercado Pago',state:'ready',...totals(),excludedTransactionCount:1,updatedAt:now,
    externalReceipts:{coaching:totals(),internal_transfer:totals(285,285,1),outgoing_payment:totals(120,120,2),unclassified:totals(),hasUnconvertedCurrencies:false}},
  {id:'kiwify',name:'Kiwify · Preparador PRO',state:'ready',...totals(400,350,1),updatedAt:now}
];
export async function renderDashboard({unavailable=false}={}) {
  const cache=new Map();
  const date=new Date();const start=new Date(date.getFullYear(),date.getMonth(),1);
  const order={id:'fixture-order',product_id:'power_pro',product_name:'Power Pro',status:'paid',amount:200,currency:'BRL',
    created_at:now,paid_at:now,gateway:'stripe',customer_name:'Cliente de teste',customer_country:'BR',
    metadata:{marketing_session_id:'session-0',marketing_consent:'granted'}};
  const events=Array.from({length:10},(_,i)=>({id:String(i),type:'product_view',session_id:`session-${i}`,product_id:'power_pro',
    locale:'pt',created_at:start.toISOString(),marketing_consent:'granted'}));
  const formatMoney=(value,currency)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency}).format(value);
  const mocks={
    'next/link':{__esModule:true,default:({children,prefetch,scroll,...props})=>React.createElement('a',props,children)},
    'next/navigation':{usePathname:()=>'/admin'},
    '@/lib/checkout/admin-auth':{requireAdmin:async()=>{}},
    '@/lib/checkout/products':{checkoutProducts:products,formatMoney},
    '@/lib/checkout/db':{listOrders:async()=>{if(unavailable)throw Error('Fixture unavailable');return [order];},
      listAnalyticsEvents:async()=>{if(unavailable)throw Error('Fixture unavailable');return events;},listActiveSitePresence:async()=>[]},
    '@/lib/checkout/stripe-reporting':{getStripeRecurringMetrics:async()=>({state:'ready',livemode:false,activeSubscribers:2,
      activeSubscriptions:2,trialingSubscriptions:0,pastDueSubscriptions:0,mrrBrlEstimate:1000,grossMrrBrlEstimate:1000,
      discountBrlEstimate:0,usdBrlRate:5.5,updatedAt:now,products:[]})},
    '@/lib/checkout/expense-reporting':{getMonthlyExpenseMetrics:async()=>({period:now.slice(0,7),isCurrentPeriod:true,
      elapsedDays:date.getDate(),daysInMonth:31,totalBrlEstimate:0,projectedBrlEstimate:0,budgetBrl:null,
      budgetUsedPercent:null,hasSpendData:false,hasUnconvertedCurrencies:false,updatedAt:now,
      sources:[{id:'meta_ads',name:'Meta Ads',category:'Marketing',state:'missing',amount:null,currency:null,brlEstimate:null,detail:'Dados de teste'}]})}
  };
  function load(file){
    if(cache.has(file))return cache.get(file).exports;
    const mod={exports:{}};cache.set(file,mod);
    vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,
      target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{
      module:mod,exports:mod.exports,Date,URL,URLSearchParams,AbortSignal,console:{error(){}},process:{env:{}},
      fetch(){throw Error('No real network allowed in fixture');},require(id){
        if(id in mocks)return mocks[id];
        if(id==='server-only')return {};
        if(id.startsWith('@/')){const stem=path.resolve(id.slice(2));return load(existsSync(stem+'.tsx')?stem+'.tsx':stem+'.ts');}
        return require(id);
      }
    });return mod.exports;
  }
  const finance=load(path.resolve('lib/checkout/financial-reporting.ts'));
  mocks['@/lib/checkout/financial-reporting']={...finance,getFinancialPeriodMetrics:async period=>({
    ...totals(600,540,2),period,state:'ready',averageTicketBrl:300,officialSourceCount:3,sources,daily:[],updatedAt:now,
    hasUnconvertedCurrencies:false})};
  const Page=load(path.resolve('app/admin/page.tsx')).default;
  return renderToStaticMarkup(await Page({searchParams:Promise.resolve({compare:'0'})}));
}
