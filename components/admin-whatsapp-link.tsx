import { MessageCircle } from "lucide-react";
import type { Order } from "@/lib/checkout/types";

type AdminWhatsAppLinkProps = {
  compact?: boolean;
  order: Order;
};

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || value;
}

function whatsappMessage(order: Order) {
  const english = order.metadata.checkout_locale === "en";
  const unfinished = ["pending", "failed", "cancelled"].includes(order.status);
  const name = firstName(order.customer_name);

  if (english) {
    return unfinished
      ? `Hi ${name}! This is the RumoAoPro team. We saw that you started an order for ${order.product_name}. Can we help with any questions about the payment?`
      : `Hi ${name}! This is the RumoAoPro team. Is everything working with your access to ${order.product_name}? We are here if you need help.`;
  }

  return unfinished
    ? `Olá, ${name}! Aqui é da equipe RumoAoPro. Vimos que você iniciou um pedido de ${order.product_name}. Podemos ajudar com alguma dúvida sobre o pagamento?`
    : `Olá, ${name}! Aqui é da equipe RumoAoPro. Está tudo certo com seu acesso ao ${order.product_name}? Estamos à disposição se precisar de ajuda.`;
}

export function AdminWhatsAppLink({
  compact = false,
  order
}: AdminWhatsAppLinkProps) {
  const digits = order.customer_whatsapp?.replace(/\D/g, "") || "";
  if (digits.length < 8 || digits.length > 15) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    whatsappMessage(order)
  )}`;

  return (
    <a
      aria-label={`Chamar ${order.customer_name} no WhatsApp`}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#1fa855] font-bold text-white transition hover:bg-[#168a45] ${
        compact ? "min-h-9 px-2.5 text-xs" : "min-h-11 w-full px-4 text-sm"
      }`}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" className="h-4 w-4" />
      WhatsApp
    </a>
  );
}
