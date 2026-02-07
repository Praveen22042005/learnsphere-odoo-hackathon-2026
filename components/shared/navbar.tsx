import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="LearnSphere Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-odoo-dark">
                LearnSphere
              </span>
              <span className="text-[10px] text-odoo-purple font-medium -mt-1">
                Learn. Earn Badges. Achieve.
              </span>
            </div>
          </Link>

          {/* Features - Hidden on mobile */}
        </div>

        {/* Auth Buttons - Right */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-odoo-purple hover:text-odoo-dark hover:bg-odoo-light font-semibold"
            >
              Login
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-odoo-purple hover:bg-odoo-pink text-white font-semibold shadow-sm">
              Signup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
