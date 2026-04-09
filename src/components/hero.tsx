import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo01, Logo02, Logo03, Logo04 } from "./logos";
import Navbar from "./navbar";

export type HeroProps = {
  headline: string;
  highlightedWord?: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

const Hero = ({
  headline,
  highlightedWord,
  subheadline,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroProps) => {
  return (
    <div>
      <Navbar />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-12 text-center">
        <h1 className="text-balance font-medium text-4xl leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {headline}{" "}
          {highlightedWord ? (
            <span className="inline-block rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground leading-[1.1] tracking-tight sm:rounded-lg sm:px-3.5">
              {highlightedWord}
            </span>
          ) : null}
        </h1>
        <p className="mt-6 text-balance text-center text-muted-foreground text-xl tracking-normal sm:text-2xl sm:leading-normal md:text-3xl">
          {subheadline}
        </p>
        <div className="mx-auto mt-10 flex w-full max-w-xs flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild className="w-full sm:w-auto" size="lg">
            <Link href={primaryCtaHref}>
              {primaryCtaLabel} <ArrowUpRight />
            </Link>
          </Button>
          {secondaryCtaLabel && secondaryCtaHref ? (
            <Button asChild className="w-full sm:w-auto" size="lg" variant="outline">
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-24 flex flex-col items-center gap-4">
          <p className="font-medium text-muted-foreground text-xs uppercase">
            Trusted by engineers at
          </p>
          <div className="mx-auto mt-4 grid max-w-screen-lg grid-cols-2 place-items-center gap-6 grayscale-100 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-12 md:grid-cols-4">
            <Logo01 className="h-7 sm:h-8" />
            <Logo02 className="h-7 sm:h-8" />
            <Logo03 className="h-7 sm:h-8" />
            <Logo04 className="h-7 sm:h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
