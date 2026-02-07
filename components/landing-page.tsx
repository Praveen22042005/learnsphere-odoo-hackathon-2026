"use client";

import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Award,
  Trophy,
  Code,
  Database,
  Lock,
  Layout,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-odoo-bg-light">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-odoo-purple/10 px-4 py-2 rounded-full mb-6">
            <Trophy className="h-5 w-5 text-odoo-purple" />
            <span className="text-sm font-semibold text-odoo-purple">
              Odoo X SNS Hackathon&apos;26 Coimbatore
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-odoo-text-dark sm:text-6xl">
            Welcome to <span className="text-odoo-purple">LearnSphere</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto">
            Discover a world of knowledge with our comprehensive eLearning
            platform. Learn from expert instructors and advance your career at
            your own pace.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button className="bg-odoo-purple hover:bg-odoo-dark text-white px-8 py-6 text-lg">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-odoo-purple text-odoo-purple hover:bg-odoo-light px-8 py-6 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <BookOpen className="h-12 w-12 text-odoo-purple mb-4" />
            <h3 className="text-xl font-semibold text-odoo-text-dark mb-2">
              Quality Content
            </h3>
            <p className="text-gray-600">
              Access high-quality courses with videos, documents, and
              interactive quizzes.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-odoo-purple mb-4" />
            <h3 className="text-xl font-semibold text-odoo-text-dark mb-2">
              Expert Instructors
            </h3>
            <p className="text-gray-600">
              Learn from industry professionals and experienced educators.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <Award className="h-12 w-12 text-odoo-purple mb-4" />
            <h3 className="text-xl font-semibold text-odoo-text-dark mb-2">
              Earn Badges
            </h3>
            <p className="text-gray-600">
              Track your progress and earn badges as you complete courses and
              quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-2xl my-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-odoo-text-dark mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-gray-600">
            Leveraging cutting-edge tools for a seamless learning experience
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Code className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              Next.js
            </h4>
            <p className="text-xs text-gray-600">React Framework</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Code className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              TypeScript
            </h4>
            <p className="text-xs text-gray-600">Type Safety</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Database className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              Supabase
            </h4>
            <p className="text-xs text-gray-600">Database</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              Clerk
            </h4>
            <p className="text-xs text-gray-600">Authentication</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Layout className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              Tailwind CSS
            </h4>
            <p className="text-xs text-gray-600">Styling</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-odoo-purple/10 flex items-center justify-center">
              <Zap className="h-8 w-8 text-odoo-purple" />
            </div>
            <h4 className="font-semibold text-odoo-text-dark text-sm mb-1">
              Shadcn UI
            </h4>
            <p className="text-xs text-gray-600">Components</p>
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-linear-to-br from-odoo-purple to-odoo-dark rounded-2xl p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About LearnSphere</h2>
            <p className="text-lg mb-8 text-white/90">
              LearnSphere is a production-grade eLearning platform designed for
              the Odoo x SNS Coimbatore Hackathon 2026. Built with modern
              technologies, it provides a comprehensive solution for online
              education with features for both instructors and learners.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">🎓</div>
                <h3 className="font-semibold mb-1">Course Management</h3>
                <p className="text-sm text-white/80">Create & manage courses</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">📊</div>
                <h3 className="font-semibold mb-1">Progress Tracking</h3>
                <p className="text-sm text-white/80">
                  Monitor learning journey
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">🏆</div>
                <h3 className="font-semibold mb-1">Gamification</h3>
                <p className="text-sm text-white/80">Badges & points system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-odoo-text-dark mb-4">
            Meet Our Team
          </h2>
          <p className="text-gray-600">
            Built with passion by talented developers
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Card className="w-64 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-odoo-purple/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-odoo-purple">PB</span>
              </div>
              <h3 className="text-xl font-semibold text-odoo-text-dark mb-1">
                Praveen BV
              </h3>
              <p className="text-sm text-gray-600">Developer</p>
            </CardContent>
          </Card>
          <Card className="w-64 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-odoo-purple/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-odoo-purple">SS</span>
              </div>
              <h3 className="text-xl font-semibold text-odoo-text-dark mb-1">
                Sarathy S
              </h3>
              <p className="text-sm text-gray-600">Developer</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
