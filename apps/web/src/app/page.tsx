import Link from "next/link";

const STATS = [
  { value: "50+",   label: "AI Models\nAvailable" },
  { value: "3min",  label: "Average Film\nCreation Time" },
  { value: "100%",  label: "Runs in\nParallel" },
];

const FEATURES = [
  {
    n: "01",
    title: "AI Director",
    desc: "Describe your video in one sentence. The Director decomposes it into scenes, shots, characters, and cinematic prompts automatically.",
  },
  {
    n: "02",
    title: "Generate All Shots",
    desc: "Every keyframe image and video clip generates in parallel via Trigger.dev. A 30-second film finishes in minutes, not hours.",
  },
  {
    n: "03",
    title: "Compose & Export",
    desc: "Shots are stitched into a final MP4 with FFmpeg the moment all clips are ready. Download or share instantly.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    credits: "50 credits on signup",
    features: ["50 free credits", "All AI models", "Unlimited projects", "720p output"],
    cta: "Get started free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/mo",
    credits: "500 credits / month",
    features: ["500 credits/month", "1080p output", "Priority generation", "Seedance 2.5 access", "Commercial license"],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$79",
    period: "/mo",
    credits: "2,500 credits / month",
    features: ["2,500 credits/month", "4K output", "API access", "Team seats", "Priority support"],
    cta: "Contact us",
    href: "mailto:hello@keyframe.ai",
    highlight: false,
  },
];

const TECH = ["fal.ai", "OpenRouter", "Trigger.dev", "FFmpeg", "Supabase"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative flex h-screen min-h-[640px] flex-col overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[#0a0a0a]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          {/* Violet glow — bottom left */}
          <div className="absolute -bottom-20 -left-20 h-[560px] w-[560px] rounded-full bg-violet-700/20 blur-[140px]" />
          {/* Subtle top glow */}
          <div className="absolute -top-10 right-1/3 h-[300px] w-[400px] rounded-full bg-violet-900/10 blur-[100px]" />
        </div>

        {/* ── Nav ── */}
        <nav className="relative z-10 flex items-center justify-between px-10 py-6 md:px-16">
          <span className="text-base font-bold tracking-tight">
            <span className="text-violet-400">Key</span>frame
          </span>

          <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how"      className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing"  className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login"    className="hover:text-white transition-colors">Sign in</Link>
          </div>

          <Link
            href="/signup"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Get started free
          </Link>
        </nav>

        {/* ── Hero body — content at bottom-left ── */}
        <div className="relative z-10 flex flex-1 items-end px-10 pb-14 md:px-16 md:pb-20">
          <div className="flex w-full items-end justify-between gap-8">

            {/* Left — headline + CTAs */}
            <div className="max-w-lg">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
                • AI-Powered Filmmaking Studio
              </p>

              <h1 className="text-5xl font-bold leading-[1.06] tracking-tight md:text-6xl lg:text-7xl">
                From idea to<br />
                <span className="text-violet-400">finished film</span><br />
                in minutes
              </h1>

              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/45">
                Describe your video. The AI Director plans every shot, generates images and clips in parallel, then composes the final MP4 automatically.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-sm font-semibold hover:bg-violet-500 transition-colors"
                >
                  Start creating — free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-white/60 hover:border-white/30 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-4 text-xs text-white/20">No credit card required · 50 free credits on signup</p>
            </div>

            {/* Right — floating preview card */}
            <div className="hidden lg:block shrink-0">
              <div className="w-64 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                {/* Preview thumbnail */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-violet-900/60 via-purple-900/30 to-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <span className="material-symbols-rounded text-[28px]">play_arrow</span>
                    </div>
                  </div>
                  {/* Film strip lines */}
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-2 pl-2 opacity-20">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-3 w-2 bg-white rounded-sm" />)}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium">AI-generated film preview</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {["bg-violet-500", "bg-blue-500", "bg-pink-500"].map((c, i) => (
                        <div key={i} className={`h-5 w-5 rounded-full border border-[#0a0a0a] ${c}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-white/40">Used by creators worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / MISSION ──────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] px-10 py-20 md:px-16">

        {/* Tech logos row */}
        <div className="mb-16 flex items-center gap-4">
          <p className="shrink-0 text-xs text-white/20">• Powered by</p>
          <div className="flex flex-wrap items-center gap-6">
            {TECH.map((t) => (
              <span key={t} className="text-sm font-medium text-white/20 hover:text-white/40 transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Mission statement */}
        <div className="max-w-4xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/25">• About</p>
          <p className="text-3xl font-bold leading-snug text-white/80 md:text-4xl lg:text-5xl">
            We help{" "}
            <span className="text-white">creators, agencies,</span>
            {" "}and studios turn ideas into{" "}
            <span className="inline-flex items-center gap-2">
              AI-generated
              <span className="inline-flex h-8 items-center rounded-full bg-violet-600/20 px-3 text-[60%] font-semibold text-violet-300 align-middle">
                cinematic
              </span>
            </span>
            {" "}films — with a professional production workflow.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-px border border-white/[0.06] sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.value} className="bg-[#0a0a0a] px-10 py-10">
              <p className="text-6xl font-bold tracking-tight text-white md:text-7xl">{s.value}</p>
              <p className="mt-6 text-sm leading-relaxed text-white/30" style={{ whiteSpace: "pre-line" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="border-t border-white/[0.06] px-10 py-24 md:px-16">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">

          {/* Left — heading */}
          <div className="lg:w-80 shrink-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">• How It Works</p>
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Three steps<br />to a finished<br />film
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/40">
              Keyframe handles every step of the production pipeline so you can focus on the creative.
            </p>
          </div>

          {/* Right — numbered steps */}
          <div className="flex flex-1 flex-col divide-y divide-white/[0.06]">
            {FEATURES.map((f) => (
              <div key={f.n} className="group flex items-start gap-6 py-8 first:pt-0">
                <span className="mt-0.5 shrink-0 text-xs font-semibold text-white/20">{f.n}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <span className="material-symbols-rounded text-[20px] text-white/20 group-hover:text-violet-400 transition-colors">
                      arrow_outward
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section id="features" className="border-t border-white/[0.06] px-10 py-24 md:px-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">• Features</p>
        <div className="mb-16 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Everything in<br />one studio
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/40 lg:text-right">
            We provide a complete AI production pipeline — from idea to final export — in a single canvas-based tool.
          </p>
        </div>

        <div className="grid gap-px border border-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "smart_toy",     title: "AI Director",       desc: "Describe your film. The Director writes the full shot plan automatically." },
            { icon: "image",         title: "Image Generation",  desc: "FLUX Pro generates a cinematic keyframe for every shot." },
            { icon: "movie",         title: "Video Generation",  desc: "MiniMax, Kling, and Seedance animate each keyframe into a 5-second clip." },
            { icon: "account_tree",  title: "Node Canvas",       desc: "Wire characters, locations, and prompts into a visual production graph." },
            { icon: "bolt",          title: "Parallel Jobs",     desc: "All shots generate simultaneously. A 30-second film finishes in minutes." },
            { icon: "compress",      title: "Auto Compose",      desc: "Clips are stitched into a final MP4 with music the moment all shots are ready." },
          ].map((f) => (
            <div key={f.title} className="group bg-[#0a0a0a] p-8 hover:bg-white/[0.02] transition-colors">
              <span className="material-symbols-rounded text-[28px] text-white/20 group-hover:text-violet-400 transition-colors">
                {f.icon}
              </span>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-white/[0.06] px-10 py-24 md:px-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">• Pricing</p>
        <div className="mb-16 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Simple,<br />credit-based<br />pricing
          </h2>
          <p className="max-w-xs text-sm text-white/40 lg:text-right">
            1 credit = 1 image generation<br />5 credits = 1 video clip
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-lg p-8 ${
                plan.highlight
                  ? "bg-violet-600/10 ring-1 ring-violet-500/30"
                  : "bg-white/[0.03] ring-1 ring-white/[0.06]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold">
                  Most popular
                </span>
              )}
              <p className="text-sm text-white/40">{plan.name}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/30">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-violet-400">{plan.credits}</p>

              <ul className="my-8 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="material-symbols-rounded text-[16px] text-violet-400">check</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "border border-white/15 hover:border-white/30 text-white/70 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] px-10 py-24 md:px-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Ready to make<br />your film?
          </h2>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="text-sm text-white/40">Sign up in 30 seconds. 50 free credits, no card needed.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 self-start rounded-full bg-violet-600 px-8 py-3.5 text-base font-semibold hover:bg-violet-500 transition-colors lg:self-end"
            >
              Start creating free
              <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-10 py-10 md:px-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <span className="text-base font-bold">
            <span className="text-violet-400">Key</span>frame
          </span>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} Keyframe. AI-powered filmmaking.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/login"  className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
