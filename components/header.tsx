"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, MouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Container } from "@/components/container";
import { cn } from "@/lib/cn";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const navLinkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [planeX, setPlaneX] = useState<number | null>(null);
  const [isPlaneFlying, setIsPlaneFlying] = useState(false);
  const [planeDirection, setPlaneDirection] = useState<"left" | "right">("right");
  const [isLogoVisible, setIsLogoVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const activeHref = navItems.find((item) => isActiveLink(item.href))?.href ?? "/";

  const getCloudCenterX = useCallback((href: string) => {
    const nav = desktopNavRef.current;
    const link = navLinkRefs.current.get(href);

    if (!nav || !link) {
      return null;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    return linkRect.left - navRect.left + linkRect.width / 2;
  }, []);

  useLayoutEffect(() => {
    const updatePlanePosition = () => {
      const nextX = getCloudCenterX(activeHref);

      if (nextX !== null) {
        setPlaneX(nextX);
      }
    };

    updatePlanePosition();
    window.addEventListener("resize", updatePlanePosition);

    return () => window.removeEventListener("resize", updatePlanePosition);
  }, [activeHref, getCloudCenterX]);

  function setNavLinkRef(href: string) {
    return (node: HTMLAnchorElement | null) => {
      if (node) {
        navLinkRefs.current.set(href, node);
      } else {
        navLinkRefs.current.delete(href);
      }
    };
  }

  function handleAnimatedNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0 ||
      href === pathname ||
      (href !== "/" && pathname.startsWith(`${href}/`))
    ) {
      return;
    }

    const canAnimate = window.matchMedia("(min-width: 768px)").matches;

    if (!canAnimate) {
      return;
    }

    const nextX = getCloudCenterX(href);

    if (nextX === null) {
      return;
    }

    event.preventDefault();

    if (planeX !== null) {
      setPlaneDirection(nextX >= planeX ? "right" : "left");
    }

    setIsPlaneFlying(true);
    setPlaneX(nextX);

    window.setTimeout(() => {
      router.push(href);
    }, 600);

    window.setTimeout(() => {
      setIsPlaneFlying(false);
    }, 680);
  }

  return (
    <header className={cn("site-header", isScrolled && "site-header-scrolled")}>
      <Container className="site-header-inner">
        <Link
          href="/"
          prefetch={true}
          className="site-logo-link"
          aria-label={siteContent.meta.name}
        >
          {isLogoVisible ? (
            <Image
              src="/images/company-logo.png"
              alt={siteContent.meta.name}
              width={180}
              height={180}
              priority
              className="site-logo-image"
              onError={() => setIsLogoVisible(false)}
            />
          ) : (
            <span className="site-logo-fallback">Arunand&apos;s Aviation Academy</span>
          )}
        </Link>
        <nav
          aria-label="Primary"
          className="site-desktop-nav"
          ref={desktopNavRef}
        >
          {planeX !== null ? (
            <span
              aria-hidden="true"
              className={cn(
                "nav-plane-indicator",
                isPlaneFlying && "nav-plane-indicator-flying",
                planeDirection === "left" && "nav-plane-indicator-left",
              )}
              style={{ "--plane-x": `${planeX}px` } as CSSProperties}
            >
              <span className="nav-plane-trail" />
              <span className="nav-plane-icon">✈</span>
            </span>
          ) : null}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              ref={setNavLinkRef(item.href)}
              onClick={(event) => handleAnimatedNavigation(event, item.href)}
              className={cn("site-nav-link", isActiveLink(item.href) && "site-nav-link-active")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/dashboard"
            prefetch={true}
            className={cn(
              "site-admin-link",
              isActiveLink("/admin/dashboard") && "site-admin-link-active",
            )}
          >
            Admin Login
          </Link>
          <button
            type="button"
            className="site-mobile-toggle"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </Container>
      <div className={cn("site-mobile-panel", isMobileMenuOpen && "site-mobile-panel-open")}>
        <Container className="py-3">
          <nav aria-label="Primary mobile" className="site-mobile-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn("site-nav-link", isActiveLink(item.href) && "site-nav-link-active")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
