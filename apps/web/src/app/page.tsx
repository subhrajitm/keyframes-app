import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Play, Film, Zap, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: "🎭",
    title: "AI Director",
    desc: "Describe your video in plain language. The Director decomposes it into scenes, shots, and cinematic prompts automatically.",
  },
  {
    icon: "🖼",
    title: "Image Generation",
    desc: "FLUX Pro generates a keyframe for every shot. Upload reference photos to lock in consistent characters and locations.",
  },
  {
    icon: "🎬",
    title: "Video Generation",
    desc: "MiniMax H3 Max animates each keyframe into a 5-second clip. Kling, Wan, and Seedance available for different styles.",
  },
  {
    icon: "🗺",
    title: "Node Canvas",
    desc: "Wire characters, locations, and prompts into a visual production graph. See the whole film at a glance.",
  },
  {
    icon: "⚡",
    title: "Parallel Jobs",
    desc: "All shots generate simultaneously via Trigger.dev. A 30-second film finishes in minutes, not hours.",
  },
  {
    icon: "🎥",
    title: "Auto Compose",
    desc: "Shots are stitched into a final MP4 with FFmpeg the moment all clips are ready. Download or share instantly.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Describe your film",
    desc: 'Type one sentence: "A 30-second coffee brand ad, warm cinematic tones, 3 scenes." The AI Director writes the full shot plan.',
  },
  {
    n: "02",
    title: "Generate all shots",
    desc: "Hit Generate All. Every shot runs in parallel — keyframe image then animated clip. Watch the scene panel update live.",
  },
  {
    n: "03",
    title: "Compose & download",
    desc: "When all shots are done, hit Compose. Your finished MP4 appears on the dashboard ready to download or share.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    credits: "50 credits to start",
    features: ["50 free credits on signup", "All AI models", "Unlimited projects", "720p output"],
    cta: "Get started free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    credits: "500 credits / month",
    features: ["500 credits/month", "1080p output", "Priority generation", "Seedance 2.5 access", "Commercial license"],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$79",
    period: "/month",
    credits: "2,500 credits / month",
    features: ["2,500 credits/month", "4K output", "ComfyUI local GPU", "API access", "Team seats"],
    cta: "Contact us",
    href: "mailto:hello@keyframe.ai",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#07070e] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#07070e]/80 px-6 py-3 backdrop-blur-sm md:px-12">
        <span className="text-base font-bold tracking-tight">
          <span className="text-violet-400">Key</span>frame
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-white/50 hover:text-white">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started free <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-32 text-center">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet-600/10 blur-[120px]" />
          </div>

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-300">
              <Zap className="h-3 w-3" />
              AI-powered video production
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
              From idea to{" "}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                finished film
              </span>
              {" "}in minutes
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/40 md:text-xl">
              Keyframe is an AI film studio. Describe your video, and the Director
              plans every shot. Generate images and video clips in parallel, then
              compose the final MP4 automatically.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-12 gap-2 px-8 text-base">
                <Link href="/signup">
                  <Wand2 className="h-4 w-4" />
                  Start creating — free
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 gap-2 px-6 text-base text-white/50 hover:text-white">
                <Link href="/login">
                  Sign in <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/25">No credit card required · 50 free credits on signup</p>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 md:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-violet-400">How it works</p>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">Three steps to a finished film</h2>

            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                  <span className="text-4xl font-black text-white/5">{step.n}</span>
                  <div>
                    <h3 className="font-semibold text-white/90">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/40">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 md:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-violet-400">Features</p>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">Everything in one studio</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-colors hover:border-violet-500/20 hover:bg-violet-500/[0.03]"
                >
                  <div className="mb-3 text-3xl">{f.icon}</div>
                  <h3 className="mb-2 font-semibold text-white/90">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/40">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-6 py-20 md:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-violet-400">Pricing</p>
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">Simple, credit-based pricing</h2>
            <p className="mb-16 text-center text-sm text-white/40">1 credit = 1 image generation. 3 credits = 1 video clip.</p>

            <div className="grid gap-4 md:grid-cols-3">
              {PRICING.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    plan.highlight
                      ? "border-violet-500/40 bg-violet-500/5"
                      : "border-white/8 bg-white/[0.02]"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-xs font-semibold">
                      Most popular
                    </div>
                  )}
                  <div className="mb-1 text-sm font-medium text-white/50">{plan.name}</div>
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-white/40">{plan.period}</span>
                  </div>
                  <p className="mb-5 text-xs text-violet-300">{plan.credits}</p>

                  <ul className="mb-6 flex flex-col gap-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="text-violet-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.highlight ? "default" : "outline"}
                    className="mt-auto"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 text-center md:px-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to make your film?</h2>
            <p className="mt-4 text-white/40">Sign up in 30 seconds. 50 free credits, no card needed.</p>
            <Button asChild size="lg" className="mt-8 h-12 gap-2 px-10 text-base">
              <Link href="/signup">
                <Play className="h-4 w-4" />
                Start creating free
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-white/20 sm:flex-row">
          <span className="font-bold text-white/40"><span className="text-violet-400">Key</span>frame</span>
          <span>© {new Date().getFullYear()} Keyframe. AI-powered filmmaking.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white/40">Sign in</Link>
            <Link href="/signup" className="hover:text-white/40">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
