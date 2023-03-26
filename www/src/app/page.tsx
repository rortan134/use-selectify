import { ChevronRight,ExternalLink } from "lucide-react";

import { Button } from "../components/Button";
import { Container } from "../components/Container";
import Installation from "../components/Installation";
import LandingSection from "../components/LandingSection";

export default function Page() {
  return (
    <div className="relative col-span-full w-full">
      <div className="absolute inset-x-0">
        <div className="relative inset-0 h-[100svh] overflow-hidden">
          <div className="absolute -left-16 -top-32 h-56 w-96 rounded-2xl border border-neutral-50 opacity-75 shadow-sm shadow-slate-50/25" />
          <div className="absolute -left-20 -top-28 h-56 w-96 rounded-2xl border border-neutral-50 opacity-50 shadow-sm shadow-slate-50/25" />
          <div className="absolute -left-24 -top-24 h-56 w-96 rounded-2xl border border-neutral-50 opacity-30 shadow-sm shadow-slate-50/25" />
          <div className="absolute -right-12 -bottom-20 h-56 w-96 rounded-2xl border border-neutral-50 opacity-75 shadow-sm shadow-slate-50/25" />
          <div className="absolute -right-16 -bottom-16 h-56 w-96 rounded-2xl border border-neutral-50 opacity-50 shadow-sm shadow-slate-50/25" />
          <div className="absolute -right-20 -bottom-12 h-56 w-96 rounded-2xl border border-neutral-50 opacity-30 shadow-sm shadow-slate-50/25" />
        </div>
      </div>
      <LandingSection>
        <Container className="flex flex-col items-center justify-center space-y-6 py-40">
          <h1 className="text-center text-5xl font-semibold text-slate-900 dark:text-slate-50 md:text-6xl">
            {"Drag-selection has never been easier."
              .split("")
              .map((char, i) => (
                <span
                  data-selectable
                  key={i}
                  className="transition-colors data-[selected=true]:shadow-neutral-300"
                >
                  {char}
                </span>
              ))}
          </h1>
          <p
            data-exclude
            className="text-center text-lg text-slate-900 dark:text-neutral-400"
          >
            Create complex, user-friendly drag interactions with complete
            control.
          </p>
          <div data-exclude className="flex items-center space-x-6">
            <Button
              href="https://github.com/rortan134/use-selectify#readme"
              className="shadow-md shadow-slate-50/25 hover:shadow-none"
            >
              Documentation <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button href="/docs/example" variant="ghost">
              Explore examples
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <Installation />
        </Container>
      </LandingSection>
    </div>
  );
}
