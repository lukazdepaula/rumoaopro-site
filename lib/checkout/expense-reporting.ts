import "server-only";

export type ExpenseSourceState = "ready" | "estimate" | "missing" | "error";
export type ExpenseCategory = "Marketing" | "Infraestrutura" | "Ferramentas";

export type MonthlyExpenseSource = {
  id: "meta_ads" | "supabase" | "github";
  name: string;
  category: ExpenseCategory;
  state: ExpenseSourceState;
  amount: number | null;
  currency: string | null;
  brlEstimate: number | null;
  projectionMode: "paced" | "fixed";
  detail: string;
  updatedAt: string;
};

export type MonthlyExpenseMetrics = {
  period: string;
  isCurrentPeriod: boolean;
  totalBrlEstimate: number;
  projectedBrlEstimate: number;
  budgetBrl: number | null;
  budgetUsedPercent: number | null;
  hasSpendData: boolean;
  hasUnconvertedCurrencies: boolean;
  sources: MonthlyExpenseSource[];
  updatedAt: string;
};

type MetaAccountResponse = {
  currency?: string;
  name?: string;
};

type MetaInsightsResponse = {
  data?: Array<{ spend?: string }>;
};

type GithubUsageSummary = {
  usageItems?: Array<{ netAmount?: number | string }>;
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const REPORTING_TIME_ZONE = "America/Sao_Paulo";
const cache = new Map<string, { expiresAt: number; value: MonthlyExpenseMetrics }>();
const requests = new Map<string, Promise<MonthlyExpenseMetrics>>();

function numberFromEnv(name: string, options?: { allowZero?: boolean }) {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value)) return null;
  if (options?.allowZero ? value < 0 : value <= 0) return null;
  return value;
}

function usdBrlRate() {
  return numberFromEnv("USD_TO_BRL_RATE") || 5.5;
}

function currentDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = (type: "year" | "month" | "day") =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function currentPeriodKey(date = new Date()) {
  const current = currentDateParts(date);
  return `${current.year}-${String(current.month).padStart(2, "0")}`;
}

function normalizePeriod(period?: string) {
  if (!period || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return currentPeriodKey();
  }
  return period;
}

function periodRange(period: string) {
  const [year, month] = period.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const current = currentDateParts();
  const isCurrentPeriod = period === currentPeriodKey();
  const untilDay = isCurrentPeriod ? current.day : daysInMonth;

  return {
    year,
    month,
    daysInMonth,
    elapsedDays: isCurrentPeriod ? Math.max(1, current.day) : daysInMonth,
    isCurrentPeriod,
    since: `${period}-01`,
    until: `${period}-${String(untilDay).padStart(2, "0")}`
  };
}

function toBrl(amount: number, currency: string) {
  const normalized = currency.toUpperCase();
  if (normalized === "BRL") return amount;
  if (normalized === "USD") return amount * usdBrlRate();
  return null;
}

function missingSource(
  id: MonthlyExpenseSource["id"],
  name: string,
  category: ExpenseCategory,
  projectionMode: MonthlyExpenseSource["projectionMode"],
  detail: string
): MonthlyExpenseSource {
  return {
    id,
    name,
    category,
    state: "missing",
    amount: null,
    currency: null,
    brlEstimate: null,
    projectionMode,
    detail,
    updatedAt: new Date().toISOString()
  };
}

function errorSource(
  id: MonthlyExpenseSource["id"],
  name: string,
  category: ExpenseCategory,
  projectionMode: MonthlyExpenseSource["projectionMode"],
  detail: string
): MonthlyExpenseSource {
  return {
    ...missingSource(id, name, category, projectionMode, detail),
    state: "error"
  };
}

async function requestJson<T>(url: URL | string, headers: HeadersInit) {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Expense provider returned HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

async function loadMetaAdsExpense(period: string): Promise<MonthlyExpenseSource> {
  const accessToken = process.env.META_ADS_ACCESS_TOKEN?.trim();
  const rawAccountId = process.env.META_AD_ACCOUNT_ID?.trim();
  const accountId = rawAccountId?.replace(/^act_/i, "");

  if (!accessToken || !accountId || !/^\d+$/.test(accountId)) {
    return missingSource(
      "meta_ads",
      "Meta Ads",
      "Marketing",
      "paced",
      "Conta de anúncios e token de leitura ainda não configurados."
    );
  }

  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v23.0";
  const range = periodRange(period);
  const accountUrl = new URL(`https://graph.facebook.com/${version}/act_${accountId}`);
  accountUrl.searchParams.set("fields", "name,currency");
  const insightsUrl = new URL(`https://graph.facebook.com/${version}/act_${accountId}/insights`);
  insightsUrl.searchParams.set("fields", "spend");
  insightsUrl.searchParams.set(
    "time_range",
    JSON.stringify({ since: range.since, until: range.until })
  );
  insightsUrl.searchParams.set("level", "account");

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [account, insights] = await Promise.all([
      requestJson<MetaAccountResponse>(accountUrl, headers),
      requestJson<MetaInsightsResponse>(insightsUrl, headers)
    ]);
    const amount = Number(insights.data?.[0]?.spend || 0);
    const currency = account.currency?.toUpperCase() || "BRL";

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Meta Ads returned an invalid spend amount");
    }

    return {
      id: "meta_ads",
      name: "Meta Ads",
      category: "Marketing",
      state: "ready",
      amount,
      currency,
      brlEstimate: toBrl(amount, currency),
      projectionMode: "paced",
      detail: account.name ? `Fonte oficial · ${account.name}` : "Fonte oficial da conta de anúncios",
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("[expenses.meta_ads]", error);
    return errorSource(
      "meta_ads",
      "Meta Ads",
      "Marketing",
      "paced",
      "Não foi possível consultar o gasto da conta agora."
    );
  }
}

function loadSupabaseExpense(period: string): MonthlyExpenseSource {
  if (period !== currentPeriodKey()) {
    return missingSource(
      "supabase",
      "Supabase",
      "Infraestrutura",
      "fixed",
      "O histórico do Upcoming Invoice ainda não é disponibilizado pela API pública."
    );
  }

  const amount = numberFromEnv("SUPABASE_MONTHLY_ESTIMATE_USD", { allowZero: true });
  if (amount === null) {
    return missingSource(
      "supabase",
      "Supabase",
      "Infraestrutura",
      "fixed",
      "Informe a estimativa mensal exibida no Upcoming Invoice do Supabase."
    );
  }

  return {
    id: "supabase",
    name: "Supabase",
    category: "Infraestrutura",
    state: "estimate",
    amount,
    currency: "USD",
    brlEstimate: toBrl(amount, "USD"),
    projectionMode: "fixed",
    detail: "Estimativa manual do próximo faturamento",
    updatedAt: new Date().toISOString()
  };
}

async function loadGithubExpense(period: string): Promise<MonthlyExpenseSource> {
  const token = process.env.GITHUB_BILLING_TOKEN?.trim();
  const account = process.env.GITHUB_BILLING_ACCOUNT?.trim();
  const accountType = process.env.GITHUB_BILLING_ACCOUNT_TYPE?.trim().toLowerCase();

  if (!token || !account || (accountType !== "user" && accountType !== "organization")) {
    return missingSource(
      "github",
      "GitHub",
      "Ferramentas",
      "paced",
      "Conta, tipo de conta e token de faturamento ainda não configurados."
    );
  }

  const range = periodRange(period);
  const scope = accountType === "organization" ? "organizations" : "users";
  const url = new URL(
    `https://api.github.com/${scope}/${encodeURIComponent(account)}/settings/billing/usage/summary`
  );
  url.searchParams.set("year", String(range.year));
  url.searchParams.set("month", String(range.month));

  try {
    const payload = await requestJson<GithubUsageSummary>(url, {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "RumoAoPro-Admin"
    });
    const amount = (payload.usageItems || []).reduce((total, item) => {
      const netAmount = Number(item.netAmount || 0);
      return total + (Number.isFinite(netAmount) ? netAmount : 0);
    }, 0);

    return {
      id: "github",
      name: "GitHub",
      category: "Ferramentas",
      state: "ready",
      amount,
      currency: "USD",
      brlEstimate: toBrl(amount, "USD"),
      projectionMode: "paced",
      detail: `Uso faturável oficial · ${account}`,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("[expenses.github]", error);
    return errorSource(
      "github",
      "GitHub",
      "Ferramentas",
      "paced",
      "Não foi possível consultar o faturamento da conta agora."
    );
  }
}

async function loadMonthlyExpenseMetrics(period: string): Promise<MonthlyExpenseMetrics> {
  const range = periodRange(period);
  const [metaAds, github] = await Promise.all([
    loadMetaAdsExpense(period),
    loadGithubExpense(period)
  ]);
  const sources = [metaAds, loadSupabaseExpense(period), github];
  const convertedSources = sources.filter(
    (source) =>
      (source.state === "ready" || source.state === "estimate") &&
      source.brlEstimate !== null
  );
  const totalBrlEstimate = convertedSources.reduce(
    (total, source) => total + (source.brlEstimate || 0),
    0
  );
  const projectedBrlEstimate = range.isCurrentPeriod
    ? convertedSources.reduce((total, source) => {
        const amount = source.brlEstimate || 0;
        return total +
          (source.projectionMode === "paced"
            ? (amount / range.elapsedDays) * range.daysInMonth
            : amount);
      }, 0)
    : totalBrlEstimate;
  const budgetBrl = numberFromEnv("ADMIN_MONTHLY_EXPENSE_BUDGET_BRL");
  const hasSpendData = convertedSources.length > 0;

  return {
    period,
    isCurrentPeriod: range.isCurrentPeriod,
    totalBrlEstimate,
    projectedBrlEstimate,
    budgetBrl,
    budgetUsedPercent:
      hasSpendData && budgetBrl ? (totalBrlEstimate / budgetBrl) * 100 : null,
    hasSpendData,
    hasUnconvertedCurrencies: sources.some(
      (source) =>
        (source.state === "ready" || source.state === "estimate") &&
        source.amount !== null &&
        source.brlEstimate === null
    ),
    sources,
    updatedAt: new Date().toISOString()
  };
}

export async function getMonthlyExpenseMetrics(
  requestedPeriod?: string,
  options?: { bypassCache?: boolean }
): Promise<MonthlyExpenseMetrics> {
  const period = normalizePeriod(requestedPeriod);
  if (!options?.bypassCache) {
    const cached = cache.get(period);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const pending = requests.get(period);
    if (pending) return pending;
  }

  const request = loadMonthlyExpenseMetrics(period)
    .then((value) => {
      cache.set(period, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      return value;
    })
    .finally(() => {
      if (requests.get(period) === request) requests.delete(period);
    });

  requests.set(period, request);
  return request;
}
