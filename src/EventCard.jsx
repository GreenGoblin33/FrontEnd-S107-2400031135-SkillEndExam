import React, { useEffect, useRef } from "react";

function useRenderCount(name) {
  const ref = useRef(0);
  ref.current += 1;
  useEffect(() => {
    console.log(`${name} render #${ref.current}`);
  });
}

export default function EventCard({ event, onBook, loading }) {
  useRenderCount(`EventCard ${event.id}`);

  const handlerRef = useRef();
  useEffect(() => {
    if (handlerRef.current && handlerRef.current !== onBook) {
      console.log(`Handler identity changed for event ${event.id}`);
    }
    handlerRef.current = onBook;
  }, [onBook, event.id]);

  return (
    <div className="event">
      <div className="event-left">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: "#eef7ff",
            color: "#1e40af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
          }}
        >
          {event.title.split(" ").map((w) => w[0]).join("")}
        </div>

        <div>
          <div className="event-title">{event.title}</div>
          <div className="event-meta">Event ID: {event.id}</div>
        </div>
      </div>

      <button
        className="btn-book"
        disabled={loading}
        onClick={() => onBook(event.id)}
      >
        {loading ? "Booking..." : "Book"}
      </button>
    </div>
  );
}
