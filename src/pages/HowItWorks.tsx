import { Link } from 'react-router-dom';
import { Search, FileCheck, Handshake, Rocket, ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const steps = [
  {
    icon: Search,
    title: 'Browse & Discover',
    description: 'Explore our marketplace of vetted digital marketing services. Filter by category, price, or rating to find your perfect match.',
  },
  {
    icon: FileCheck,
    title: 'Compare & Choose',
    description: 'Review detailed service descriptions, vendor portfolios, and client reviews. Make an informed decision with full transparency.',
  },
  {
    icon: Handshake,
    title: 'Connect & Collaborate',
    description: 'Message vendors directly, discuss your requirements, and agree on scope. Our secure platform protects both parties.',
  },
  {
    icon: Rocket,
    title: 'Launch & Grow',
    description: 'Start your project and track progress in real-time. Pay only when you\'re satisfied with the results.',
  },
];

const faqs = [
  {
    question: 'How do I get started on MarketFlow?',
    answer: 'Simply create a free account, browse our marketplace, and connect with vendors that match your needs. You can message vendors before making any commitment.',
  },
  {
    question: 'How are vendors vetted?',
    answer: 'All vendors go through a rigorous application process including portfolio review, identity verification, and background checks. We also monitor ongoing performance and client satisfaction.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers. Payments are held in escrow until you approve the delivered work.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a money-back guarantee. If a vendor fails to deliver as promised, you can request a full refund. Our support team will mediate any disputes.',
  },
  {
    question: 'How do I become a vendor?',
    answer: 'Sign up as a vendor and complete your profile with portfolio samples, certifications, and service offerings. Our team will review your application within 48 hours.',
  },
  {
    question: 'Are there any fees for clients?',
    answer: 'Browsing and messaging vendors is completely free. We only charge a small service fee (5%) when you make a purchase, which helps us maintain the platform.',
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            How MarketFlow Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your journey to better marketing starts here. Simple, transparent, and effective.
          </p>
          <Link to="/services">
            <Button variant="hero" size="xl">
              Start Exploring
            </Button>
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Line connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-[calc(100%-4rem)] bg-border" />
                )}
                
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <div className="pt-3">
                  <div className="text-sm font-medium text-accent mb-1">Step {index + 1}</div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground max-w-md">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Clients & Vendors */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Clients */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">For Clients</h3>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Access to vetted marketing experts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Secure payments with escrow protection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Money-back guarantee on all services
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  24/7 customer support
                </li>
              </ul>
              <Link to="/signup">
                <Button variant="gradient" className="w-full">Find a Vendor</Button>
              </Link>
            </div>

            {/* For Vendors */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">For Vendors</h3>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Access to thousands of potential clients
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Build your reputation with reviews
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Low platform fees (only 10%)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  Dedicated vendor success team
                </li>
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full">Become a Vendor</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <Button variant="outline">Contact Support</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
