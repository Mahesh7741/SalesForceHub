"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import ThemeToggle from '../../components/ThemeToggle'


export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Sign in error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <MainContent loading={loading} onGoogleSignIn={handleGoogleSignIn} />
        </>
    );
}

function Header() {
    return (
        <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
        </div>
    );
}

function MainContent({ loading, onGoogleSignIn }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background transition-colors">
            <div className="w-full max-w-md">
                <LoginCard loading={loading} onGoogleSignIn={onGoogleSignIn} />
                <Footer />
            </div>
        </div>
    );
}

function LoginCard({ loading, onGoogleSignIn }) {
    return (
        <Card className="border-2">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    variant="outline"
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    className="w-full"
                >
                    <GoogleIcon />
                    Sign in with Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                        Create an account
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

function Footer() {
    return (
        <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Cloud Manager &copy; {new Date().getFullYear()}</p>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                fill="currentColor"
            />
        </svg>
    );
}
