"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import { contact } from "@/lib/content";

type ApplicationFormProps = {
  copy: FormCopy;
  id: string;
};

export type FormCopy = {
  locale: "pt" | "en";
  thankYouPath: string;
  emailSubject: string;
  form: {
    fullName: string;
    age: string;
    location: string;
    whatsapp: string;
    email: string;
    language: string;
    level: string;
    goal: string;
    timeline: string;
    access: string;
    injuries: string;
    challenge: string;
    source: string;
    submit: string;
    emailFallback: string;
    required: string;
    select: string;
    levels: string[];
    languages: string[];
    sources: string[];
  };
};

type FormState = {
  fullName: string;
  age: string;
  location: string;
  whatsapp: string;
  email: string;
  language: string;
  level: string;
  goal: string;
  timeline: string;
  access: string;
  injuries: string;
  challenge: string;
  source: string;
};

const initialState: FormState = {
  fullName: "",
  age: "",
  location: "",
  whatsapp: "",
  email: "",
  language: "",
  level: "",
  goal: "",
  timeline: "",
  access: "",
  injuries: "",
  challenge: "",
  source: ""
};

const requiredFields: (keyof FormState)[] = [
  "fullName",
  "age",
  "location",
  "whatsapp",
  "email",
  "language",
  "level",
  "goal",
  "timeline",
  "access",
  "challenge",
  "source"
];

const utmKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term"
];

export function ApplicationForm({ copy, id }: ApplicationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [touched, setTouched] = useState(false);
  const [utmLine, setUtmLine] = useState("UTMs: none");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const found = utmKeys
      .filter((key) => params.has(key))
      .map((key) => `${key}=${params.get(key)}`);
    const referrer = document.referrer ? `referrer=${document.referrer}` : "";
    setUtmLine([found.join(" | "), referrer].filter(Boolean).join(" | ") || "UTMs: none");
  }, []);

  const missingRequired = useMemo(
    () => requiredFields.filter((field) => !form[field].trim()),
    [form]
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const message = useMemo(() => {
    const localeLabel =
      copy.locale === "pt"
        ? "Nova aplicação Assessoria RumoAoPro"
        : "New RumoAoPro Coaching Application";

    return [
      localeLabel,
      "",
      `${copy.form.fullName}: ${form.fullName}`,
      `${copy.form.age}: ${form.age}`,
      `${copy.form.location}: ${form.location}`,
      `${copy.form.whatsapp}: ${form.whatsapp}`,
      `${copy.form.email}: ${form.email}`,
      `${copy.form.language}: ${form.language}`,
      `${copy.form.level}: ${form.level}`,
      `${copy.form.goal}: ${form.goal}`,
      `${copy.form.timeline}: ${form.timeline}`,
      `${copy.form.access}: ${form.access}`,
      `${copy.form.injuries}: ${form.injuries || "Not informed"}`,
      `${copy.form.challenge}: ${form.challenge}`,
      `${copy.form.source}: ${form.source}`,
      "",
      utmLine
    ].join("\n");
  }, [copy, form, utmLine]);

  const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    message
  )}`;
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    copy.emailSubject
  )}&body=${encodeURIComponent(message)}`;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (missingRequired.length > 0) {
      return;
    }

    window.open(whatsappHref, "_blank", "noopener,noreferrer");
    router.push(copy.thankYouPath);
  };

  return (
    <form
      className="rounded-lg border border-ink/10 bg-white p-5 shadow-clean md:p-7"
      id={id}
      onSubmit={onSubmit}
    >
      {touched && missingRequired.length > 0 ? (
        <div className="mb-5 rounded-md border border-signal/30 bg-signal/10 px-4 py-3 text-sm font-semibold text-signal">
          {copy.form.required}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label={copy.form.fullName}
          onChange={(value) => updateField("fullName", value)}
          required
          value={form.fullName}
        />
        <TextField
          label={copy.form.age}
          onChange={(value) => updateField("age", value)}
          required
          type="number"
          value={form.age}
        />
        <TextField
          label={copy.form.location}
          onChange={(value) => updateField("location", value)}
          required
          value={form.location}
        />
        <TextField
          label={copy.form.whatsapp}
          onChange={(value) => updateField("whatsapp", value)}
          required
          value={form.whatsapp}
        />
        <TextField
          label={copy.form.email}
          onChange={(value) => updateField("email", value)}
          required
          type="email"
          value={form.email}
        />
        <SelectField
          label={copy.form.language}
          onChange={(value) => updateField("language", value)}
          options={copy.form.languages}
          placeholder={copy.form.select}
          required
          value={form.language}
        />
        <SelectField
          label={copy.form.level}
          onChange={(value) => updateField("level", value)}
          options={copy.form.levels}
          placeholder={copy.form.select}
          required
          value={form.level}
        />
        <SelectField
          label={copy.form.source}
          onChange={(value) => updateField("source", value)}
          options={copy.form.sources}
          placeholder={copy.form.select}
          required
          value={form.source}
        />
        <TextAreaField
          label={copy.form.goal}
          onChange={(value) => updateField("goal", value)}
          required
          value={form.goal}
        />
        <TextAreaField
          label={copy.form.timeline}
          onChange={(value) => updateField("timeline", value)}
          required
          value={form.timeline}
        />
        <TextAreaField
          label={copy.form.access}
          onChange={(value) => updateField("access", value)}
          required
          value={form.access}
        />
        <TextAreaField
          label={copy.form.injuries}
          onChange={(value) => updateField("injuries", value)}
          value={form.injuries}
        />
      </div>
      <div className="mt-4">
        <TextAreaField
          label={copy.form.challenge}
          onChange={(value) => updateField("challenge", value)}
          required
          value={form.challenge}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b90f20]"
          type="submit"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
          {copy.form.submit}
        </button>
        <a
          className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-ink/20 px-5 py-3 text-sm font-bold text-ink transition hover:bg-smoke"
          href={emailHref}
        >
          <Mail aria-hidden="true" className="h-4 w-4" />
          {copy.form.emailFallback}
        </a>
      </div>
    </form>
  );
}

function TextField({
  label,
  onChange,
  value,
  type = "text",
  required = false
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/20 bg-smoke px-3 text-sm text-ink"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
  required = false
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/20 bg-smoke px-3 text-sm text-ink"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  value,
  required = false
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        className="focus-ring mt-2 min-h-28 w-full resize-y rounded-md border border-ink/20 bg-smoke px-3 py-3 text-sm text-ink"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
