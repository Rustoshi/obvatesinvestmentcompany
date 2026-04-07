"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
    interface Window {
        smartsupp: any;
        _smartsupp: any;
    }
}

export default function SmartsuppChat() {
    const pathname = usePathname();

    // Hide on admin routes
    const isAdmin = pathname?.startsWith("/admin");

    useEffect(() => {
        if (isAdmin) return;

        // Prevent duplicate initialization
        if (window.smartsupp) return;

        window._smartsupp = window._smartsupp || {};
        window._smartsupp.key = "a774e47cbd66e96c97175b32cfd9d442511b888d";
        window._smartsupp.offsetY = 112; // ~7em, raises widget above mobile bottom nav

        const smartsupp = (window.smartsupp = function () {
            (smartsupp as any)._.push(arguments);
        });
        (smartsupp as any)._ = [];

        const s = document.getElementsByTagName("script")[0];
        const c = document.createElement("script");
        c.type = "text/javascript";
        c.charset = "utf-8";
        c.async = true;
        c.src = "https://www.smartsuppchat.com/loader.js?";
        s.parentNode?.insertBefore(c, s);
    }, [isAdmin]);

    // Hide/show the widget when navigating between admin and non-admin routes
    useEffect(() => {
        if (typeof window !== "undefined" && window.smartsupp) {
            if (isAdmin) {
                window.smartsupp("chat:hide");
            } else {
                window.smartsupp("chat:show");
            }
        }
    }, [isAdmin]);

    if (isAdmin) return null;

    return null;
}
