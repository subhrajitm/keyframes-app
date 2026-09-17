import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-white/10 px-8 py-4">
        <span className="text-lg font-bold">
          <span className="text-violet-400">Key</span>frame
        </span>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          AI-powered filmmaking
        </div>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Turn ideas into{" "}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            complete films
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-white/50">
          A node-based AI studio to generate characters, locations, and shots — then
          assemble them into a finished film.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start creating</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: "🎭",
              title: "Character Studio",
              desc: "Generate consistent characters across every shot.",
            },
            {
              icon: "🗺",
              title: "Location Builder",
              desc: "Build 360° environments as reusable sets.",
            },
            {
              icon: "🎬",
              title: "Node Canvas",
              desc: "Wire characters, locations, and prompts into a production graph.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-violet-500/30"
            >
              <div className="mb-2 text-2xl">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
