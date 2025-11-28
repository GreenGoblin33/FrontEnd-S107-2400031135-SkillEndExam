import React, { useCallback, useState, useRef, useEffect } from "react";



const eventsSeed = [
  { id: 1, title: "React Conf 2026" },
  { id: 2, title: "Node Summit" },
  { id: 3, title: "Frontend Masters" },
];

function useRenderCount(name) {
  const ref = useRef(0);
  ref.current += 1;
  useEffect(() => {
    console.log(`${name} render #${ref.current}`);
  });
  return ref.current;
}


const EventCard = React.memo(function EventCard({ event, onBook }) {
  useRenderCount(`EventCard ${event.id}`);

  
  const handlerRef = useRef();
  useEffect(() => {
    const changed = handlerRef.current && handlerRef.current !== onBook;
    if (changed) console.log(`Handler identity changed for event ${event.id}`);
    handlerRef.current = onBook;
  }, [onBook, event.id]);

  return (
    <div className="p-4 border rounded mb-2 flex justify-between items-center">
      <div>
        <div className="font-semibold">{event.title}</div>
        <div className="text-sm text-gray-500">Event ID: {event.id}</div>
      </div>
      <button
        onClick={() => onBook(event.id)}
        className="px-3 py-1 rounded bg-blue-600 text-white"
      >
        Book Event
      </button>
    </div>
  );
});

export default function App() {
  useRenderCount("App");

  const [events, setEvents] = useState(eventsSeed);
  const [useMemoizedHandlers, setUseMemoizedHandlers] = useState(true);
  const [bookings, setBookings] = useState([]);

  
  const nonMemoizedOnBook = (id) => {
    console.log("nonMemoizedOnBook called for", id);
    setBookings((b) => [...b, { id, when: new Date().toISOString() }]);
  };

  
  const memoizedOnBook = useCallback(
    (id) => {
      console.log("memoizedOnBook called for", id);
      setBookings((b) => [...b, { id, when: new Date().toISOString() }]);
    },
    
    []
  );

  
  const createHandler = (eventId) => {
    if (useMemoizedHandlers) {
      
      if (!createHandler._map) createHandler._map = new Map();
      if (!createHandler._map.has(eventId)) {
        const fn = (id) => {
          console.log("per-event memoized handler called for", id);
          setBookings((b) => [...b, { id, when: new Date().toISOString() }]);
        };
        createHandler._map.set(eventId, fn);
        console.log(`Created stable per-event handler for ${eventId}`);
      }
      return createHandler._map.get(eventId);
    }

    
    console.log(`Created NON-stable per-event handler for ${eventId}`);
    return (id) => {
      console.log("dynamic handler called for", id);
      setBookings((b) => [...b, { id, when: new Date().toISOString() }]);
    };
  };

  const addEvent = () => {
    const nextId = events.length ? events[events.length - 1].id + 1 : 1;
    setEvents((e) => [...e, { id: nextId, title: `New Event ${nextId}` }]);
  };

  const clearBookings = () => setBookings([]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Event Booking Demo</h1>

      <div className="mb-4 flex gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useMemoizedHandlers}
            onChange={(e) => setUseMemoizedHandlers(e.target.checked)}
          />
          Use stable (memoized) per-event handlers
        </label>

        <button onClick={addEvent} className="px-3 py-1 rounded bg-green-600 text-white">
          Add Event
        </button>

        <button onClick={clearBookings} className="px-3 py-1 rounded bg-gray-600 text-white">
          Clear Bookings
        </button>
      </div>

      <div>
        {events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            
            onBook={useMemoizedHandlers ? createHandler(ev.id) : createHandler(ev.id)}
          />
        ))}
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Bookings ({bookings.length})</h2>
        <ul>
          {bookings.map((b, i) => (
            <li key={i} className="text-sm text-gray-700">
              Event {b.id} at {new Date(b.when).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <strong>How to test:</strong>
        <ol className="list-decimal ml-6">
          <li>Open the browser console (DevTools).</li>
          <li>Toggle the "Use stable (memoized) per-event handlers" checkbox on/off.</li>
          <li>Click "Add Event" and watch for console logs named "Created stable..." or "Created NON-stable...".</li>
          <li>Re-render the App (e.g., add an event) and observe EventCard render logs.
            With stable handlers, EventCard won't re-render just because the parent's function identity changed.
          </li>
        </ol>
      </div>
    </div>
  );
}
