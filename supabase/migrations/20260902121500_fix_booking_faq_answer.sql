UPDATE public.faqs
SET answer = 'Message us on WhatsApp with your vehicle details and preferred service for the fastest response, or fill out our contact form. We''ll respond within 24 hours with availability and a personalised quote.'
WHERE question = 'How do I book an appointment?'
  AND answer LIKE '{"key"%';
