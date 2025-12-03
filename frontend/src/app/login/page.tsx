"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function LoginPage() {
    const handleLogin = () => {
        window.location.href = "http://localhost:4000/auth/google";
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-base">
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-vignette z-10" />

            <div className="z-20 w-full max-w-md">
                <Card className="text-center space-y-8">
                    <SectionTitle subtitle="Members Only">Login</SectionTitle>

                    <p className="text-text-primary font-sans font-light">
                        Please sign in to access exclusive content and membership features.
                    </p>

                    <Button
                        onClick={handleLogin}
                        className="w-full hover:bg-bg-accent hover:text-white transition-colors"
                    >
                        Sign in with Google
                    </Button>
                </Card>
            </div>
        </main>
    );
}
