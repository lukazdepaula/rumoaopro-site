"use client";

import { useRef, type FormEvent, type FormHTMLAttributes } from "react";

type SingleSubmitFormProps = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  pendingLabel?: string;
};

export function SingleSubmitForm({
  children,
  pendingLabel,
  ...props
}: SingleSubmitFormProps) {
  const submitted = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitted.current) {
      event.preventDefault();
      return;
    }

    submitted.current = true;
    event.currentTarget.setAttribute("aria-busy", "true");

    const submitButton = event.currentTarget.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );
    if (submitButton) {
      submitButton.disabled = true;
      if (pendingLabel) submitButton.textContent = pendingLabel;
    }
  }

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
