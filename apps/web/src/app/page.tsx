import Link from "next/link";

const FEATURES = [
  {
    icon: "smart_toy",
    name: "Director",
    desc: "Describe your film. The AI Director breaks it into scenes, shots, and cinematic prompts — automatically. No manual scripting.",
  },
  {
    icon: "account_tree",
    name: "Canvas",
    desc: "Wire characters, locations, and prompts in a visual node graph. See every production dependency at a glance.",
  },
  {
    icon: "bolt",
    name: "Generate",
    desc: "Every keyframe and video clip runs in parallel. A 30-second film finishes in minutes — not hours.",
  },
  {
    icon: "compress",
    name: "Compose",
    desc: "Clips are stitched with FFmpeg the moment generation completes. Add music, export, share.",
  },
];

const STATS = [
  { value: "3 min",  label: "average film creation time" },
  { value: "50+",   label: "AI models available" },
  { value: "100%",  label: "shots run in parallel" },
  { value: "4.2×",  label: "faster than manual editing" },
];

const FAQS = [
  {
    q: "What is the AI Director?",
    a: "It's a GPT-4 powered planner that reads your project description and writes a complete shot plan — scenes, camera angles, lighting, character blocking, and cinematic prompts for every model in your pipeline.",
  },
  {
    q: "How does credit-based pricing work?",
    a: "1 credit = 1 image generation via FLUX Pro. 3 credits = 1 video clip via MiniMax, Kling, or Seedance. You start with 50 free credits on signup.",
  },
  {
    q: "Can I use my own AI model keys?",
    a: "Yes. Pro and Studio plans support bring-your-own-key for fal.ai and OpenRouter, so your generations are billed directly to your accounts.",
  },
  {
    q: "What video formats are supported?",
    a: "Output is MP4 (H.264). Resolution ranges from 720p on Free to 4K on Studio. You can set aspect ratio per project: 16:9, 9:16, or 1:1.",
  },
];

const TECH = ["fal.ai", "OpenRouter", "Trigger.dev", "Supabase", "FFmpeg", "Next.js"];

// SVG node-graph illustration (abstract, like Strand's hero visual)
function NodesIllustration() {
  return (
    <svg viewBox="0 0 400 320" fill="none" className="w-full max-w-md opacity-40" aria-hidden>
      {/* Edges */}
      {[
        [80, 60, 200, 140], [200, 140, 320, 80], [200, 140, 200, 240],
        [200, 240, 100, 280], [200, 240, 310, 260], [320, 80, 360, 180],
        [360, 180, 310, 260],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="white" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 4" />
      ))}
      {/* Nodes */}
      {[
        [80,60],[200,140],[320,80],[200,240],[100,280],[310,260],[360,180],
      ].map(([cx,cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5" fill="white" fillOpacity="0.5" />
          <circle cx={cx} cy={cy} r="12" stroke="white" strokeOpacity="0.1" strokeWidth="1" fill="none" />
        </g>
      ))}
      {/* Labels */}
      {[
        [80,48,"Director"],[200,128,"Canvas"],[320,68,"Generate"],
        [200,228,"Compose"],[100,268,"Export"],
      ].map(([cx,cy,label], i) => (
        <text key={i} x={cx} y={cy} textAnchor="middle"
          fontSize="9" fill="white" fillOpacity="0.3" fontFamily="monospace">
          {label as string}
        </text>
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>

      {/* ── NAV ───────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b border-white/[0.06] px-8 py-4 md:px-16">
        <div className="flex items-center gap-10">
          <span className="text-sm font-bold tracking-tight">Keyframe</span>
          <div className="hidden items-center gap-7 text-sm text-white/45 md:flex">
            <Link href="#features" className="transition-colors hover:text-white">Features</Link>
            <Link href="#pricing"  className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/login"    className="transition-colors hover:text-white">Blog</Link>
            <Link href="/login"    className="transition-colors hover:text-white">About</Link>
          </div>
        </div>
        <Link
          href="/signup"
          className="rounded border border-white/20 px-4 py-1.5 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          Get started
        </Link>
      </nav>

      {/* ── ANNOUNCING BANNER ─────────────────────────────────────── */}
      <div className="flex items-center justify-center border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-center">
        <span className="text-xs text-white/40">
          Introducing fal.ai Seedance 2.5 — the sharpest video model yet.{" "}
          <Link href="/signup" className="text-white/70 underline underline-offset-2 hover:text-white transition-colors">
            Try it free
          </Link>
        </span>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-8 py-20 md:px-16 md:py-28">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">

          {/* Left — text */}
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl lg:text-7xl">
              The AI filmmaking<br />
              studio for every<br />
              creative team.
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-white/45">
              Keyframe builds a filmmaking pipeline around every project. Describe your idea, get a complete shot plan, generate every frame in parallel, export in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/[0.04]"
              >
                Create a project
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded border border-white/10 px-5 py-2.5 text-sm text-white/45 transition-colors hover:border-white/20 hover:text-white/70"
              >
                See a demo
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/20">Trusted by 50+ creators. No credit card required.</p>
          </div>

          {/* Right — abstract illustration */}
          <div className="flex shrink-0 items-start justify-center lg:w-[400px] lg:pt-4">
            <NodesIllustration />
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-8 md:px-16">
        <div className="flex flex-wrap items-center gap-8">
          <span className="text-xs text-white/20">Powered by</span>
          {TECH.map((t) => (
            <span key={t} className="text-sm font-medium text-white/20 transition-colors hover:text-white/40">{t}</span>
          ))}
        </div>
      </section>

      {/* ── PULL QUOTE ────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <p className="max-w-4xl text-2xl font-bold leading-snug text-white/60 md:text-3xl lg:text-4xl">
          Your team wastes hours writing shot lists, sourcing references, and waiting on renders.{" "}
          <span className="text-white">Keyframe turns that into one conversation.</span>
        </p>
      </section>

      {/* ── DIRECTOR FEATURE ──────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Director</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Your AI film<br />director. Always on.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/40">
              Describe your project in plain language. The Director maps it to scenes, assigns characters, writes cinematic prompts, and pre-configures every node in your canvas — ready to generate.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {["Parses natural language descriptions", "Assigns shots to scenes automatically", "Writes model-specific cinematic prompts"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/40">
                  <span className="material-symbols-rounded mt-0.5 shrink-0 text-[14px] text-white/30">check_small</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white">
              Explore Director
              <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Mockup */}
          <div className="flex items-center justify-center rounded border border-white/[0.07] bg-[#0a0a0a] p-6">
            <div className="w-full max-w-sm space-y-2">
              {/* Director bar mock */}
              <div className="flex items-center gap-3 rounded border border-white/[0.07] bg-black px-3 py-2.5">
                <span className="material-symbols-rounded text-[14px] text-white/20">auto_awesome</span>
                <span className="flex-1 text-xs text-white/25">A 30-second coffee brand promo, warm cinematic tones…</span>
                <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/30">Direct</span>
              </div>
              {/* Generated shots */}
              {[
                { scene: "Scene 1", shot: "Barista close-up — steam rising", status: "Done", color: "text-emerald-400" },
                { scene: "Scene 1", shot: "Latte art reveal, slow motion", status: "Generating", color: "text-amber-400" },
                { scene: "Scene 2", shot: "Customer in warm morning light", status: "Queued", color: "text-white/25" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[10px] text-white/25">{s.scene}</span>
                    <span className="truncate text-xs text-white/60">{s.shot}</span>
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium ${s.color}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <p className="mb-14 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Platform</p>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.name}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03]">
                <span className="material-symbols-rounded text-[18px] text-white/40">{f.icon}</span>
              </div>
              <h3 className="mb-2 font-semibold text-white/85">{f.name}</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/35">{f.desc}</p>
              <Link href="/signup" className="inline-flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/60">
                Explore
                <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONNECT YOUR STACK ────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Integrations</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Connect your<br />creative stack.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/40">
              Keyframe connects to fal.ai, OpenRouter, Trigger.dev and more — out of the box. Pro plans support bring-your-own-key for full cost control.
            </p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white">
              View integrations
              <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "fal.ai",       desc: "Image & video generation", icon: "image" },
              { name: "OpenRouter",   desc: "AI Director model",        icon: "smart_toy" },
              { name: "Trigger.dev",  desc: "Parallel job queue",       icon: "bolt" },
              { name: "Supabase",     desc: "Auth & database",          icon: "storage" },
              { name: "FFmpeg",       desc: "Video composition",        icon: "movie" },
              { name: "FLUX Pro",     desc: "Keyframe generation",      icon: "photo_camera" },
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/[0.07] bg-white/[0.03]">
                  <span className="material-symbols-rounded text-[14px] text-white/30">{t.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/70">{t.name}</p>
                  <p className="truncate text-[10px] text-white/25">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL + STAT ────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-2 text-7xl font-bold tracking-tight md:text-8xl">3 min</p>
            <p className="text-sm text-white/30">average film creation time, from idea to export.</p>

            <blockquote className="mt-12 border-l-2 border-white/[0.08] pl-5">
              <p className="text-base leading-relaxed text-white/55 italic">
                "Keyframe generated a complete 30-second promo from a single description. Our team used to spend two days on this. Now it's done before our morning standup."
              </p>
              <footer className="mt-4">
                <p className="text-sm font-semibold text-white/70">Priya M.</p>
                <p className="text-xs text-white/30">Creative Director, Studio Luna</p>
              </footer>
            </blockquote>
          </div>

          {/* Portrait placeholder */}
          <div className="flex items-center justify-center overflow-hidden rounded border border-white/[0.06] bg-[#0a0a0a] min-h-[300px]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                <span className="material-symbols-rounded text-[28px] text-white/20">person</span>
              </div>
              <p className="text-xs text-white/20">Creator portrait</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-16 md:px-16">
        <p className="mb-12 max-w-2xl text-xl font-bold text-white/60 md:text-2xl">
          Your team already has the ideas.{" "}
          <span className="text-white">Keyframe gives you the execution.</span>
        </p>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-bold tracking-tight text-white md:text-5xl">{s.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Pricing</p>
        <div className="mb-12 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">Simple, credit-based.</h2>
          <p className="text-sm text-white/30">1 credit = 1 image · 3 credits = 1 video clip</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              name: "Free", price: "$0", period: "", credits: "50 credits on signup",
              features: ["50 free credits", "All AI models", "Unlimited projects", "720p output"],
              cta: "Get started free", href: "/signup", highlight: false,
            },
            {
              name: "Pro", price: "$20", period: "/mo", credits: "500 credits / month",
              features: ["500 credits/month", "1080p output", "Priority generation", "Seedance 2.5 access", "Commercial license"],
              cta: "Start Pro", href: "/signup?plan=pro", highlight: true,
            },
            {
              name: "Studio", price: "$79", period: "/mo", credits: "2,500 credits / month",
              features: ["2,500 credits/month", "4K output", "API access", "Team seats", "Priority support"],
              cta: "Contact us", href: "mailto:hello@keyframe.ai", highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded border p-7 ${
                plan.highlight ? "border-white/25 bg-white/[0.03]" : "border-white/[0.07] bg-white/[0.01]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-px left-6 rounded-b border border-t-0 border-white/20 bg-white px-2.5 py-0.5 text-[10px] font-bold text-black">
                  POPULAR
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">{plan.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/25">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-white/30">{plan.credits}</p>
              <ul className="my-7 flex flex-col gap-2.5 border-t border-white/[0.06] pt-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/45">
                    <span className="material-symbols-rounded text-[14px] text-white/30">check_small</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-auto inline-flex items-center justify-center rounded border py-2.5 text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "border-white/30 text-white hover:bg-white hover:text-black"
                    : "border-white/10 text-white/45 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-8 py-20 md:px-16">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">FAQ</p>
            <h2 className="text-2xl font-bold md:text-3xl">
              Frequently asked<br />questions
            </h2>
            <p className="mt-4 text-sm text-white/35">
              Everything you need to know about Keyframe. Can&apos;t find the answer?{" "}
              <a href="mailto:hello@keyframe.ai" className="text-white/55 underline underline-offset-2 hover:text-white transition-colors">
                Email us.
              </a>
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-5 first:pt-0">
                <p className="text-sm font-semibold text-white/80">{faq.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/35">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-8 py-28 text-center md:px-16 md:py-36">
        {/* Background nodes */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <NodesIllustration />
        </div>

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Your film,<br />finally created.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/35">
            Stop planning. Start generating. 50 free credits on signup — no card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded bg-white px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded border border-white/15 px-8 py-3 text-sm text-white/40 transition-colors hover:border-white/25 hover:text-white/60"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="px-8 py-14 md:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <p className="text-sm font-bold">Keyframe</p>
            <p className="mt-3 text-sm leading-relaxed text-white/25">
              AI-powered filmmaking studio. From one sentence to a finished film.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {[
              { heading: "Features", links: [{ label: "Director", href: "#features" }, { label: "Canvas", href: "#features" }, { label: "Generate", href: "#features" }, { label: "Compose", href: "#features" }] },
              { heading: "Pricing",  links: [{ label: "Free", href: "#pricing" }, { label: "Pro", href: "#pricing" }, { label: "Studio", href: "#pricing" }] },
              { heading: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Changelog", href: "#" }, { label: "Status", href: "#" }, { label: "Blog", href: "#" }] },
              { heading: "Connect", links: [{ label: "X / Twitter", href: "#" }, { label: "GitHub", href: "#" }, { label: "Discord", href: "#" }, { label: "Contact", href: "mailto:hello@keyframe.ai" }] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/20">{col.heading}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-white/30 transition-colors hover:text-white/60">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} Keyframe. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-white/20">
            <span className="cursor-default">Privacy policy</span>
            <span className="cursor-default">Terms of service</span>
            <span className="cursor-default">Cookie settings</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
