import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Clock, FileText, Play, Star, Trophy } from "lucide-react";
import Image from "next/image";

const MOCK_COURSES = [
  {
    id: 1,
    title: "Basics of Odoo CRM",
    description: "Master lead management and sales pipelines.",
    tags: ["CRM"],
    lessonsCount: 12,
    duration: "4h 20m",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    progress: 45,
  },
  {
    id: 2,
    title: "Inventory Management",
    description: "Advanced techniques for warehouse optimization.",
    tags: ["Inventory", "Logistics"],
    lessonsCount: 8,
    duration: "2h 15m",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
    progress: 10,
  },
  {
    id: 3,
    title: "Odoo Custom Apps",
    description: "Build your first module from scratch using Python.",
    tags: ["Development"],
    lessonsCount: 15,
    duration: "6h 45m",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    progress: 0,
  },
];

export default function LearnerDashboardPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold border-b-4 border-primary pb-1 inline-block">
            Learning Dashboard
          </h1>
        </div>

        {/* Welcome Banner */}
        <div className="p-6 bg-primary rounded-2xl text-primary-foreground shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Welcome back!</h2>
            <p className="opacity-90 max-w-lg">
              You&apos;ve completed 80% of your weekly goal. Keep up the great
              work learning Odoo!
            </p>
          </div>
          <Award className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 text-primary-foreground opacity-10" />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COURSES.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col"
            >
              <div className="h-40 relative overflow-hidden bg-muted">
                <Image
                  src={course.image}
                  alt={course.title}
                  width={400}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="text-white w-10 h-10 fill-current" />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-primary text-lg mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {course.lessonsCount}{" "}
                    Lessons
                  </span>
                </div>

                <div className="mt-auto">
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <Button
                    className="w-full font-bold"
                    variant={course.progress > 0 ? "default" : "secondary"}
                  >
                    {course.progress > 0 ? "Continue Learning" : "Start Course"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Widget */}
      <aside className="w-full xl:w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Circular Progress Placeholder */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-accent"
                  fill="transparent"
                  strokeDasharray="364"
                  strokeDashoffset="120"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs text-muted-foreground">Total 25</span>
                <span className="font-bold text-xl">Points</span>
                <span className="font-bold text-accent text-sm">Newbie</span>
              </div>
            </div>

            {/* Badges List */}
            <div className="w-full mt-8 space-y-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                BADGES
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="font-bold text-orange-500">Newbie</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">20 Pts</span>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between text-sm items-center opacity-50">
                <span className="font-bold text-orange-400">Explorer</span>
                <span className="text-muted-foreground text-xs">40 Pts</span>
              </div>
              <div className="flex justify-between text-sm items-center opacity-50">
                <span className="font-bold text-orange-400">Achiever</span>
                <span className="text-muted-foreground text-xs">60 Pts</span>
              </div>
              <div className="flex justify-between text-sm items-center opacity-50">
                <span className="font-bold text-orange-400">Specialist</span>
                <span className="text-muted-foreground text-xs">80 Pts</span>
              </div>
              <div className="flex justify-between text-sm items-center opacity-50">
                <span className="font-bold text-orange-400">Expert</span>
                <span className="text-muted-foreground text-xs">100 Pts</span>
              </div>
              <div className="flex justify-between text-sm items-center opacity-50">
                <span className="font-bold text-orange-400">Master</span>
                <span className="text-muted-foreground text-xs">120 Pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5" />
              Next Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90 mb-1">Earn more points to reach</p>
            <p className="text-2xl font-bold">Explorer</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
