"use client";

import { useEffect } from "react";

export function DesktopNavbarFloat() {
  useEffect(() => {
    const header = document.getElementById("desktop-site-header");
    const desktop = window.matchMedia("(min-width: 1024px)");
    if (!header) return;

    let floating = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) {
        floating = false;
        header.classList.remove("is-floating");
        return;
      }

      if (!floating && window.scrollY > 100) floating = true;
      else if (floating && window.scrollY < 60) floating = false;

      header.classList.toggle("is-floating", floating);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", update);
      if (frame) window.cancelAnimationFrame(frame);
      header.classList.remove("is-floating");
    };
  }, []);

  return null;
}
