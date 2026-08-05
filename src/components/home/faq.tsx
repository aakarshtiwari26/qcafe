import { SectionHeading } from "@/components/shared/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FAQ({ siteName, avgDeliveryTimeMinutes }: { siteName: string; avgDeliveryTimeMinutes: number }) {
  const items = [
    {
      q: "How long does delivery take?",
      a: `Most orders arrive within ${avgDeliveryTimeMinutes} minutes of confirmation, depending on how busy the kitchen is.`,
    },
    {
      q: "Which payment methods are supported?",
      a: "Cash on delivery is available today. Online payments are coming soon.",
    },
    {
      q: "Can I track my order?",
      a: "Yes — every order gets a short tracking ID and a live status timeline from received to delivered.",
    },
    {
      q: "How do I change my delivery hostel?",
      a: `Go to Dashboard → Settings and update your hostel any time. ${siteName} delivers to every listed hostel.`,
    },
    {
      q: "What if an item is unavailable?",
      a: "Items go out of stock automatically when the kitchen runs out — you'll never be able to order something that can't be made.",
    },
  ];

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="FAQ" title="Common questions" align="center" className="mx-auto" />
      <Accordion type="single" collapsible className="mt-8 w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
