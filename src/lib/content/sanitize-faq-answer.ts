const CORRUPTED_FAQ_ANSWER =
  "Message us on WhatsApp with your vehicle details and preferred service for the fastest response, or fill out our contact form. We'll respond within 24 hours with availability and a personalised quote.";

function isCorruptedReactAnswer(answer: string): boolean {
  const trimmed = answer.trim();
  if (!trimmed.startsWith("{")) {
    return false;
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      props?: { children?: unknown };
    };

    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "props" in parsed &&
      Array.isArray(parsed.props?.children)
    );
  } catch {
    return trimmed.includes('"props"') && trimmed.includes('"children"');
  }
}

export function sanitizeFaqAnswer(answer: string): string {
  if (isCorruptedReactAnswer(answer)) {
    return CORRUPTED_FAQ_ANSWER;
  }

  return answer;
}
