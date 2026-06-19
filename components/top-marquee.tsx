const marqueeText =
  "✈️ 100% Placement Support • 100% Training Commitment • Placement-Oriented Aviation Courses • Refund Assurance as per Academy Terms • Internship Support • Job-Ready Aviation Skills •";

export function TopMarquee() {
  return (
    <div className="top-marquee" aria-label={marqueeText}>
      <div className="top-marquee-track" aria-hidden="true">
        <span>{marqueeText}</span>
        <span>{marqueeText}</span>
        <span>{marqueeText}</span>
      </div>
    </div>
  );
}
