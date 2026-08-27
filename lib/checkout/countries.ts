import {
  getCountries,
  getCountryCallingCode,
  type CountryCode
} from "libphonenumber-js/min";

export type CheckoutCountryOption = {
  code: CountryCode;
  dialCode: string;
  flag: string;
  name: string;
};

const priorityCountries: CountryCode[] = [
  "BR",
  "IE",
  "US",
  "GB",
  "PT",
  "ES",
  "FR",
  "DE",
  "IT",
  "NL",
  "CA",
  "AU",
  "SG"
];

const euroCountries = new Set<CountryCode>([
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK"
]);

const commonLocalCurrencies: Partial<Record<CountryCode, string>> = {
  AE: "AED",
  AR: "ARS",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  CL: "CLP",
  CO: "COP",
  CZ: "CZK",
  DK: "DKK",
  GB: "GBP",
  HK: "HKD",
  HU: "HUF",
  ID: "IDR",
  IL: "ILS",
  IN: "INR",
  JP: "JPY",
  KR: "KRW",
  MX: "MXN",
  MY: "MYR",
  NO: "NOK",
  NZ: "NZD",
  PE: "PEN",
  PH: "PHP",
  PL: "PLN",
  QA: "QAR",
  RO: "RON",
  SA: "SAR",
  SE: "SEK",
  SG: "SGD",
  TH: "THB",
  TR: "TRY",
  US: "USD",
  UY: "UYU",
  ZA: "ZAR"
};

const phoneExamples: Partial<Record<CountryCode, string>> = {
  AU: "412 345 678",
  BR: "11 99999-9999",
  CA: "416 555 0123",
  ES: "612 345 678",
  FR: "6 12 34 56 78",
  GB: "7700 900123",
  IE: "83 123 4567",
  IT: "312 345 6789",
  PT: "912 345 678",
  SG: "8123 4567",
  US: "555 123 4567"
};

const priorityIndex = new Map(
  priorityCountries.map((country, index) => [country, index])
);

function countryFlag(country: CountryCode) {
  return String.fromCodePoint(
    ...country.split("").map((letter) => 127397 + letter.charCodeAt(0))
  );
}

export function getCheckoutCountries(locale: "pt" | "en") {
  const displayNames = new Intl.DisplayNames(
    [locale === "pt" ? "pt-BR" : "en"],
    { type: "region" }
  );

  return getCountries()
    .map<CheckoutCountryOption>((code) => ({
      code,
      dialCode: `+${getCountryCallingCode(code)}`,
      flag: countryFlag(code),
      name: displayNames.of(code) || code
    }))
    .sort((left, right) => {
      const leftPriority = priorityIndex.get(left.code);
      const rightPriority = priorityIndex.get(right.code);

      if (leftPriority !== undefined || rightPriority !== undefined) {
        return (leftPriority ?? Number.MAX_SAFE_INTEGER) -
          (rightPriority ?? Number.MAX_SAFE_INTEGER);
      }

      return left.name.localeCompare(right.name, locale === "pt" ? "pt-BR" : "en");
    });
}

export function getCountryDialCode(country: string) {
  const normalized = country.trim().toUpperCase() as CountryCode;
  if (!getCountries().includes(normalized)) return "";
  return `+${getCountryCallingCode(normalized)}`;
}

export function getPhoneExample(country: string, locale: "pt" | "en") {
  const normalized = country.trim().toUpperCase() as CountryCode;
  return phoneExamples[normalized] ||
    (locale === "en" ? "phone number" : "número de telefone");
}

export function getPreferredPresentmentCurrency(country: string) {
  const normalized = country.trim().toUpperCase() as CountryCode;
  if (euroCountries.has(normalized)) return "EUR";
  return commonLocalCurrencies[normalized] || null;
}

export function combineInternationalPhone(
  phone: string,
  countryDialCode: string
) {
  const normalized = phone.trim();
  if (!normalized) return "";
  if (normalized.startsWith("+")) return normalized;
  return `${countryDialCode} ${normalized}`.trim();
}
