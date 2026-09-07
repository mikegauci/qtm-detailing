export function getFaqAnswerText(
  question: string,
  answer: string,
  whatsappUrl: string,
): string {
  if (question === "How do I book an appointment?") {
    return `Message us on WhatsApp (${whatsappUrl}) with your vehicle details and preferred service for the fastest response. We'll respond within 24 hours with availability and a personalised quote.`;
  }

  return answer.replace(/\s+/g, " ").trim();
}
