import Banner from "@/components/banner";
import Footer from "@/components/footer";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <Hero
          headline="Drop in a contract."
          highlightedWord="Fast"
          subheadline="We extract deal terms from your PDF (embedded text or OCR) and generate a clean, shareable net sheet."
          primaryCtaLabel="Upload contract PDF"
          primaryCtaHref="/uploads/parse"
        />
        <Banner />
      </main>
      <Footer />
    </div>
  );
}
