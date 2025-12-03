"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

interface User {
    name: string;
    image: string;
}

export const UserMenu = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Fetch user from backend
        fetch("http://localhost:4000/auth/me", {
            credentials: "include",
        })
            .then((res) => {
                if (res.ok) return res.json();
                return { user: null };
            })
            .then((data) => setUser(data.user))
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await fetch("http://localhost:4000/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/";
    };

    if (!user) {
        return (
            <a href="/login">
                <Button size="sm">LOGIN</Button>
            </a>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm font-sans text-text-primary hidden md:inline">
                {user.name}
            </span>
            <Button size="sm" onClick={handleLogout}>
                LOGOUT
            </Button>
        </div>
    );
};
