export function sanitizeFaqAnswer(answer: string): string {
  if (answer.startsWith('{"key"') && answer.includes('"props"')) {
    return "Message us on WhatsApp with your vehicle details and preferred service for the fastest response, or fill out our contact form. We'll respond within 24 hours with availability and a personalised quote.";
  }

  return answer;
}
