"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { getSafeImageSrc, isValidImageSrc, shouldBypassImageOptimizer } from "@/lib/media";
import type { PublicEvent } from "@/lib/public-content-data";
import { scheduleBrowserIdleTask } from "@/src/lib/browser-idle";
import { loadClientEvents } from "@/src/lib/firebase-client-loaders";

export function EventsGridClient({ initialEvents }: { initialEvents: PublicEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const result = await loadClientEvents();

        if (!cancelled) {
          setEvents(result.events);
          setWarning(result.warning);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase events unavailable; using fallback events.", error);
        }

        if (!cancelled) {
          setEvents([]);
          setWarning("Events will be available soon.");
        }
      }
    }

    const cancelIdleTask = scheduleBrowserIdleTask(() => {
      void loadEvents();
    });

    return () => {
      cancelled = true;
      cancelIdleTask();
    };
  }, []);

  return (
    <div className="grid gap-6">
      {warning && events.length > 0 ? (
        <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
          {warning}
        </p>
      ) : null}

      {events.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-3">
          {events.map((event) => (
            <article key={event.id ?? event.title} className="premium-card p-6">
              {isValidImageSrc(event.image) ? (
                <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-sky-50">
                  {(() => {
                    const safeImage = getSafeImageSrc(event.image);

                    return (
                  <Image
                    src={safeImage}
                    alt={`${event.title} event`}
                    fill
                    loading="lazy"
                    quality={72}
                    unoptimized={shouldBypassImageOptimizer(safeImage)}
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                    );
                  })()}
                </div>
              ) : null}
              {event.date ? (
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  {event.date}
                </p>
              ) : null}
              {event.location ? (
                <p className="mt-2 text-sm font-medium text-brand-dark">{event.location}</p>
              ) : null}
              <h2 className="mt-4 text-2xl font-semibold text-foreground">{event.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{event.description}</p>
              {event.applyLink ? (
                event.applyLink.startsWith("/") ? (
                  <Link
                    href={event.applyLink}
                    prefetch={true}
                    className="premium-button mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Apply
                  </Link>
                ) : (
                  <a
                    href={event.applyLink}
                    className="premium-button mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Apply
                  </a>
                )
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="premium-card px-6 py-10 text-center">
          <p className="text-lg font-semibold text-brand-dark">Events will be available soon.</p>
        </div>
      )}
    </div>
  );
}
