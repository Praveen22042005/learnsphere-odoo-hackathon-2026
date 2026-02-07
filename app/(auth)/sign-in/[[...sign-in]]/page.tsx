import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80"
      >
        <Image
          src="/logo.png"
          alt="LearnSphere Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span className="font-heading text-xl font-semibold text-foreground">
          LearnSphere
        </span>
      </Link>

      {/* Sign In Form */}
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-border",
            headerTitle: "font-heading",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border-border hover:bg-accent text-foreground",
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}
