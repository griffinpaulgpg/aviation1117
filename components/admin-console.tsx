"use client";

import { useMemo, useState } from "react";

const initialCourses = ["Cabin Crew", "Ground Handling", "Hospitality"];
const initialEvents = ["Airport Visit Program", "Mock Interview Week", "Industry Guest Lecture"];
const initialTestimonials = ["Vivek - SpiceJet", "Sushmitha - Celebi Aviation"];
const initialPhotos = ["Airport exposure", "Student grooming", "Classroom training"];
const enquiries = [
  {
    name: "Ananya Rao",
    interest: "Cabin Crew",
    status: "New",
  },
  {
    name: "Rahul S",
    interest: "Airport Operations",
    status: "Follow up",
  },
  {
    name: "Meera Joseph",
    interest: "Logistics and Management",
    status: "Counselling booked",
  },
];

type CollectionName = "courses" | "events" | "testimonials" | "photos";

export function AdminConsole() {
  const [courses, setCourses] = useState(initialCourses);
  const [events, setEvents] = useState(initialEvents);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [photos, setPhotos] = useState(initialPhotos);
  const [drafts, setDrafts] = useState<Record<CollectionName, string>>({
    courses: "",
    events: "",
    testimonials: "",
    photos: "",
  });

  const collections = useMemo(
    () => ({
      courses: {
        title: "Courses",
        description: "Add or remove programs shown on the website.",
        items: courses,
        setItems: setCourses,
      },
      events: {
        title: "Events",
        description: "Publish airport visits, lectures, and placement activities.",
        items: events,
        setItems: setEvents,
      },
      testimonials: {
        title: "Testimonials",
        description: "Manage student reviews and placement stories.",
        items: testimonials,
        setItems: setTestimonials,
      },
      photos: {
        title: "Photos",
        description: "Organize gallery labels before real uploads are connected.",
        items: photos,
        setItems: setPhotos,
      },
    }),
    [courses, events, photos, testimonials],
  );

  function addItem(name: CollectionName) {
    const value = drafts[name].trim();

    if (!value) {
      return;
    }

    collections[name].setItems((current) => [value, ...current]);
    setDrafts((current) => ({ ...current, [name]: "" }));
  }

  function removeItem(name: CollectionName, item: string) {
    collections[name].setItems((current) => current.filter((entry) => entry !== item));
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Photos", photos.length],
          ["Enquiries", enquiries.length],
          ["Events", events.length],
          ["Courses", courses.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-white/14 rounded-lg border bg-white/10 p-5 text-white shadow-2xl shadow-black/10"
          >
            <p className="text-3xl font-semibold">{value}</p>
            <p className="mt-2 text-sm text-white/70">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Enquiries
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Student inbox</h2>
          </div>
          <button className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            Export Leads
          </button>
        </div>
        <div className="mt-6 grid gap-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.name}
              className="grid gap-2 rounded-lg border border-border bg-background p-4 md:grid-cols-3"
            >
              <p className="font-semibold text-foreground">{enquiry.name}</p>
              <p className="text-sm text-muted">{enquiry.interest}</p>
              <p className="text-sm font-semibold text-brand">{enquiry.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {(Object.keys(collections) as CollectionName[]).map((name) => {
          const collection = collections[name];

          return (
            <article key={name} className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground">{collection.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{collection.description}</p>
              <div className="mt-5 flex gap-3">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
                  value={drafts[name]}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [name]: event.target.value }))
                  }
                  placeholder={`Add ${collection.title.toLowerCase()}`}
                />
                <button
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => addItem(name)}
                  type="button"
                >
                  Add
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {collection.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4"
                  >
                    <p className="text-sm font-medium text-foreground">{item}</p>
                    <button
                      className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
                      onClick={() => removeItem(name, item)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
