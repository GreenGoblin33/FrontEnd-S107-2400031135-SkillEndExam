import React, { useCallback, useEffect, useRef, useState } from "react";
import EventCard from "./EventCard";

const seed = [
  { id: 1, title: "React Conf 2026" },
  { id: 2, title: "Node Summit" },
  { id: 3, title: "Frontend Masters" }
];

function useRenderCount(name) {
  const ref = useRef(0);
  ref.current += 1;
  useEffect(() => {
    console.log(`${name} render #${ref.current}`);
  });
  return ref.current;
}


function fakeBookApi(id) {
  return new Promise((res) => {
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      res({ id, when: new Date().toISOString(), success: true });
    }, delay);
  });
}

export default function App() {
  useRenderCount("App");

  const [events, setEvents] = useState(seed);
  const [bookingsMemo, setBookingsMemo] = useState([]);
  const [bookingsNon, setBookingsNon] = useState([]);
  const [loading, setLoading] = useState({});

  const nonMemoOnBook = (id) => {
    console.log("nonMemoOnBook →", id);
    setLoading((s) => ({ ...s, [id]: true }));
    fakeBookApi(id).then((res) => {
      setBookingsNon((b) => [...b, res]);
      setLoading((s) => ({ ...s, [id]: false }));
    });
  };

  const memoOnBook = useCallback((id) => {
    console.log("memoOnBook →", id);
    setLoading((s) => ({ ...s, [id]: true }));
    fakeBookApi(id).then((res) => {
      setBookingsMemo((b) => [...b, res]);
      setLoading((s) => ({ ...s, [id]: false }));
    });
  }, []);

  const mapRef = useRef(new Map());
  const getStableHandler = useCallback((eventId) => {
    if (!mapRef.current.has(eventId)) {
      mapRef.current.set(eventId, (id) => {
        console.log("stable handler →", id);
        setLoading((s) => ({ ...s, [id]: true }));
        fakeBookApi(id).then((res) => {
          setBookingsMemo((b) => [...b, res]);
          setLoading((s) => ({ ...s, [id]: false }));
        });
      });
      console.log("Created stable handler for", eventId);
    }
    return mapRef.current.get(eventId);
  }, []);

  const addEvent = () => {
    const next = events.length ? events[events.length - 1].id + 1 : 1;
    setEvents((e) => [...e, { id: next, title: `New Event ${next}` }]);
  };

  const clearBookings = () => {
    setBookingsMemo([]);
    setBookingsNon([]);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="title">
          <div className="logo">EB</div>
          <div>
            <h1>Event Booking — Memoized vs Non-memoized</h1>
            <div className="header-sub">Compare performance with stable handlers</div>
          </div>
        </div>

        <div className="controls">
          <button className="btn" onClick={addEvent}>Add event</button>
          <button className="btn ghost" onClick={clearBookings}>Clear bookings</button>
        </div>
      </div>

      <div className="grid">
        {}
        <div className="card">
          <div className="card-header">
            <strong>Memoized flow</strong>
            <span className="badge">useCallback + stable handlers</span>
          </div>

          {events.map((ev) => (
            <EventCard
              key={`m-${ev.id}`}
              event={ev}
              loading={!!loading[ev.id]}
              onBook={getStableHandler(ev.id)}
            />
          ))}

          <div className="bookings">
            <strong>Memo bookings</strong>
            <ul>
              {bookingsMemo.map((b, i) => (
                <li key={i}>
                  Event {b.id} at {new Date(b.when).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {}
        <div className="card">
          <div className="card-header">
            <strong>Non-memoized flow</strong>
            <span className="badge">new handler every render</span>
          </div>

          {events.map((ev) => (
            <EventCard
              key={`n-${ev.id}`}
              event={ev}
              loading={!!loading[ev.id]}
              onBook={() => nonMemoOnBook(ev.id)}
            />
          ))}

          <div className="bookings">
            <strong>Non-memo bookings</strong>
            <ul>
              {bookingsNon.map((b, i) => (
                <li key={i}>
                  Event {b.id} at {new Date(b.when).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
