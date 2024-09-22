// @ts-ignore


// import { SignedIn, SignedOut, } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavItems from "./NavItems";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  SignedIn,
  UserButton,
  SignedOut,
} from "@clerk/nextjs";
import MobileNav from "./MobileNav";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w- flex justify-center items-center gap-3">
          <Image
            src="/assets/images/google.svg"
            width={38}
            height={38}
            alt="GDSC Events logo"
          />
          <div>
            <h3 className="font-bold text-[1.3rem]">GDSC EVENTS</h3>
          </div>
        </Link>

        <ClerkLoading>
          <div>Loading</div>

          {/* <Loader className="h-5 w-5 text-muted-foreground animate-spin" /> */}
        </ClerkLoading>
        <SignedIn>
          <nav className="md:flex-between hidden w-full max-w-xs">
            <NavItems />
          </nav>
        </SignedIn>

        <ClerkLoaded>
          <SignedOut>
            <SignUpButton
              mode="modal"
              afterSignInUrl="/learn"
              afterSignUpUrl="/learn"
            >
              
            </SignUpButton>
            <SignInButton
              mode="modal"
              afterSignInUrl="/home"
              afterSignUpUrl="/home"
            >
              
            </SignInButton>
          </SignedOut>

       


        </ClerkLoaded>

        <div className="flex w-32 justify-end gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <MobileNav />
          </SignedIn>

          <SignedOut>
            <Button asChild className="rounded-full" size="lg">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Header;
