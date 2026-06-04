"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { SectionHeading } from "@/components/section-heading";
import type { PublicTestimonialReview } from "@/lib/content-data";
import { scheduleBrowserIdleTask } from "@/src/lib/browser-idle";

type TestimonialReviewsSectionProps = {
  initialReviews?: PublicTestimonialReview[];
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function StarButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-2xl transition ${active ? "scale-110 text-amber-400" : "text-sky-200 hover:text-amber-300"}`}
      aria-label={active ? "Selected rating star" : "Select rating star"}
    >
      ★
    </button>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < rating ? "text-base text-amber-400" : "text-base text-sky-100"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialReviewsSection({
  initialReviews = [],
}: TestimonialReviewsSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const { loadClientTestimonialReviews } = await import("@/src/lib/firebase-client-loaders");
        const result = await loadClientTestimonialReviews();

        if (!cancelled) {
          setReviews(result.reviews);
          setWarning(result.warning);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase testimonial reviews unavailable; keeping current reviews.", error);
        }
      }
    }

    const cancelIdleTask = scheduleBrowserIdleTask(() => {
      void loadReviews();
    }, 4200, 9000);

    return () => {
      cancelled = true;
      cancelIdleTask();
    };
  }, []);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [reviews],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!name.trim() || !review.trim()) {
      setMessage({ type: "error", text: "Please complete the required review fields." });
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage({ type: "error", text: "Please select a rating from 1 to 5 stars." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const [{ createFirebaseTestimonialReview }, { invalidateClientFirebaseCache }] =
        await Promise.all([
          import("@/src/lib/firebase-services"),
          import("@/src/lib/firebase-client-loaders"),
        ]);
      const nextReview = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `review-${Date.now()}`,
        name: name.trim(),
        course: course.trim() || null,
        review: review.trim(),
        rating,
        createdAt: new Date().toISOString(),
      } satisfies PublicTestimonialReview;

      await createFirebaseTestimonialReview(nextReview);
      invalidateClientFirebaseCache("testimonial-reviews");
      setReviews((current) => [nextReview, ...current]);
      setName("");
      setCourse("");
      setReview("");
      setRating(5);
      setMessage({ type: "success", text: "Thank you for sharing your review." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error && error.message
            ? error.message
            : "Unable to submit your review right now. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="observe-section aviation-section py-20">
      <SectionHeading
        eyebrow="Student Voices"
        title="Student Testimonials & Reviews"
        description="Share your experience with Arunand’s Aviation Academy"
      />

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="premium-card p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Full Name <span className="sr-only">(required)</span>
              <input
                className="rounded-xl border border-sky-100 bg-white/82 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Course / Program
              <input
                className="rounded-xl border border-sky-100 bg-white/82 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Review / Testimonial <span className="sr-only">(required)</span>
              <textarea
                className="min-h-32 resize-y rounded-xl border border-sky-100 bg-white/82 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="Tell future students about your experience."
                required
              />
            </label>

            <div className="grid gap-2 text-sm font-semibold text-foreground">
              <span>5-Star Rating</span>
              <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white/72 px-4 py-3 shadow-inner shadow-sky-950/5">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarButton
                    key={index}
                    active={index < rating}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-brand-dark">{rating}/5</span>
              </div>
            </div>

            {message ? (
              <p
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {message.text}
              </p>
            ) : null}

            {warning ? (
              <p className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm font-semibold text-muted">
                {warning}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="premium-button inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((item) => (
              <article key={item.id ?? `${item.name}-${item.createdAt}`} className="premium-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    {item.course ? (
                      <p className="mt-1 text-sm font-semibold text-brand-dark">{item.course}</p>
                    ) : null}
                  </div>
                  <Stars rating={item.rating} />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">{item.review}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {formatReviewDate(item.createdAt)}
                </p>
              </article>
            ))
          ) : (
            <div className="premium-card md:col-span-2 px-6 py-10 text-center">
              <p className="text-base font-semibold text-brand-dark">
                Be the first student to share a review.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
