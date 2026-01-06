import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

        <div className="space-y-6 max-w-4xl relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass-bg text-sm text-gray-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            AI-Powered Examination System
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
            Master Your Exams <br />
            <span className="text-gradient">With AI Precision</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience the future of testing. Unlimited questions, real-time analytics, and personalized AI feedback to skyrocket your performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/dashboard" className="glass-btn px-8 py-4 rounded-full text-lg font-semibold bg-white/10 hover:bg-white/20 min-w-[180px] text-center">
              Start Demo Exam
            </Link>
            <Link href="/auth?mode=signup" className="px-8 py-4 rounded-full text-lg font-semibold text-gray-300 hover:text-white transition-colors text-center">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI Question Generator"
            description="Never run out of practice. Our AI generates unique, curriculum-aligned questions on demand."
            icon="✨"
          />
          <FeatureCard
            title="Smart Analytics"
            description="Deep dive into your performance. Visualize strengths and weaknesses with interactive charts."
            icon="📊"
          />
          <FeatureCard
            title="Real-time Leadboard"
            description="Compete with peers globally. Climb the ranks and earn badges for your achievements."
            icon="🏆"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
      <div className="text-4xl mb-4 bg-glass-bg w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
