"use client";

import React from "react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

const NAV_ITEMS = [
    { label: "HOME", href: "/" },
    { label: "CONCERT", href: "/concerts" },
    { label: "NEWS", href: "/news" },
    { label: "BIOGRAPHY", href: "/biography" },
    { label: "HISTORY", href: "/history" },
    { label: "VIDEOS", href: "/videos" },
    { label: "SUPPORTERS", href: "/supporters" },
    { label: "CONTACT", href: "/contact" },
];

export const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 pointer-events-none">
            <div className="pointer-events-auto bg-bg-base/80 backdrop-blur-sm border-b border-border-main px-8 py-4 flex items-center gap-8 rounded-full shadow-2xl">
                <nav>
                    <ul className="flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:text-text-accent transition-colors border-b border-transparent hover:border-text-accent pb-1"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="w-[1px] h-4 bg-line-main" />

                <UserMenu />
            </div>
        </header>
    );
};
