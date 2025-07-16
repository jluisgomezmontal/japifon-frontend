"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

type Event = {
  _id: string;
  title: string;
  date: string;
  location: string;
  availableTickets: number;
};

type JwtPayload = {
  sub: string;
  email: string;
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setEmail(decoded.email);
      } catch (e) {
        console.error("Token inválido", e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get("http://localhost:3000/events");
        setEvents(res.data);
      } catch (error) {
        setError("Error al cargar eventos");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setEmail(null);
  };

  if (loading)
    return (
      <p className="text-center mt-16 text-gray-600 font-semibold text-lg animate-pulse">
        Cargando eventos...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-16 text-red-600 font-semibold text-lg">
        {error}
      </p>
    );

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {!email ? (
        <nav className="p-6 flex gap-4 justify-center">
          <Link href="/register" className="text-blue-600 hover:underline">
            Registrarse
          </Link>
          <Link href="/login" className="text-blue-600 hover:underline">
            Iniciar sesión
          </Link>
        </nav>
      ) : (
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-gray-700 font-semibold">Usuario: {email}</h3>
          <div className="flex gap-4">
            <Link
              href="/events/new"
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
            >
              + Crear nuevo evento
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <h1 className="text-5xl font-extrabold mb-12 text-center text-gray-400 tracking-tight drop-shadow-md">
        Eventos disponibles
      </h1>

      {events.length === 0 && (
        <p className="text-center text-gray-500 text-lg italic">
          No hay eventos disponibles.
        </p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {events.map((event) => (
          <li
            key={event._id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                {event.title}
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Fecha:</span>{" "}
                {new Date(event.date).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Ubicación:</span>{" "}
                {event.location}
              </p>
              <p className="text-gray-600 mt-3 mb-6">
                <span className="font-semibold text-blue-600">
                  Boletos disponibles: {event.availableTickets}
                </span>
              </p>
            </div>

            <Link
              href={`/events/${event._id}`}
              className="self-start inline-block px-5 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-colors"
            >
              Ver detalles
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
