"use client";

import { useEffect } from "react";

type SignedUploadResponse = {
  signedUrl: string;
  storagePath: string;
};

function hiddenInput(name: string, value: string) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  return input;
}

function setStatus(form: HTMLFormElement, message: string) {
  const status = form.querySelector<HTMLElement>("[data-upload-status]");
  if (status) {
    status.textContent = message;
  }
}

async function createSignedUpload(productId: string, file: File) {
  const response = await fetch("/api/admin/materials/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filename: file.name,
      productId
    })
  });

  if (!response.ok) {
    throw new Error("Não consegui preparar o upload do arquivo.");
  }

  return (await response.json()) as SignedUploadResponse;
}

async function uploadToSignedUrl(signedUrl: string, file: File) {
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);

  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "x-upsert": "true"
    },
    body
  });

  if (!response.ok) {
    throw new Error("Não consegui enviar o arquivo para o storage.");
  }
}

function removePreviousDirectUploads(form: HTMLFormElement) {
  form
    .querySelectorAll<HTMLInputElement>(
      'input[name="uploaded_file_path"], input[name="uploaded_file_name"]'
    )
    .forEach((input) => input.remove());
}

export function AdminMaterialUploadBridge() {
  useEffect(() => {
    async function onSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.matches("[data-material-upload-form]")) return;

      if (form.dataset.directUploadReady === "1") {
        delete form.dataset.directUploadReady;
        return;
      }

      const submitter =
        event.submitter instanceof HTMLElement ? event.submitter : undefined;
      const fileInput = form.querySelector<HTMLInputElement>(
        'input[type="file"][name="material_file"]'
      );

      if (
        submitter instanceof HTMLButtonElement &&
        submitter.name === "_action" &&
        submitter.value === "delete"
      ) {
        if (fileInput) {
          fileInput.value = "";
        }
        return;
      }

      const files = Array.from(fileInput?.files || []).filter(
        (file) => file.size > 0
      );
      if (files.length === 0) return;

      event.preventDefault();
      removePreviousDirectUploads(form);

      const productId = form.dataset.productId || "";

      try {
        for (const [index, file] of files.entries()) {
          setStatus(form, `Enviando arquivo ${index + 1} de ${files.length}...`);
          const upload = await createSignedUpload(productId, file);
          await uploadToSignedUrl(upload.signedUrl, file);
          form.appendChild(hiddenInput("uploaded_file_path", upload.storagePath));
          form.appendChild(hiddenInput("uploaded_file_name", file.name));
        }

        if (fileInput) {
          fileInput.value = "";
        }

        setStatus(form, "Arquivo enviado. Salvando material...");
        form.dataset.directUploadReady = "1";

        if (submitter instanceof HTMLButtonElement) {
          form.requestSubmit(submitter);
        } else {
          form.requestSubmit();
        }
      } catch (error) {
        setStatus(
          form,
          error instanceof Error
            ? error.message
            : "Não consegui enviar o arquivo. Tente novamente."
        );
      }
    }

    document.addEventListener("submit", onSubmit);
    return () => document.removeEventListener("submit", onSubmit);
  }, []);

  return null;
}
