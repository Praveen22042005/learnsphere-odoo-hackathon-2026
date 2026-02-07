import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, Award, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-odoo-light/20 via-background to-background" />

        {/* Logo / Brand */}
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="LearnSphere Logo"
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <span className="font-heading text-xl font-semibold text-foreground">
            LearnSphere
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Welcome to <span className="text-primary">LearnSphere</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Empower your learning journey with interactive courses, quizzes, and
          personalized progress tracking
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-35 border-primary text-primary hover:bg-primary/10"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild size="lg" className="min-w-35">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="mt-8 text-sm text-muted-foreground">
          Built for the Odoo Hackathon 2026
        </p>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-center text-3xl font-bold text-foreground">
            Everything you need to learn effectively
          </h2>
          <p className="mt-4 text-center text-muted-foreground">
            A complete platform designed for modern learners and instructors
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Interactive Courses"
              description="Engage with rich, multimedia course content designed to keep you focused"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Progress Tracking"
              description="Monitor your learning journey with detailed analytics and insights"
            />
            <FeatureCard
              icon={<Award className="h-6 w-6" />}
              title="Quizzes & Certs"
              description="Test your knowledge and earn certificates to showcase your skills"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Community"
              description="Connect with fellow learners and instructors in a collaborative space"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Ready to start learning?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join LearnSphere today and take the first step toward mastering new
            skills.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="min-w-45">
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 LearnSphere. Built for Odoo Hackathon.</p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold text-card-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
