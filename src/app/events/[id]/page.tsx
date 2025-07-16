'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  availableTickets: number;
  organizer: string;
  createdAt: string;
};

type JwtPayload = {
  sub: string;
  email: string;
};

export default function EventDetails() {
  const params = useParams();
  const { id } = params;

  const [event, setEvent] = useState<Event | null>(null);
  const [hasReservation, setHasReservation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          setUserId(decoded.sub);
        } catch (e) {
          console.error('Token inválido');
        }
      }
    }

    init();
  }, []);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await axios.get(`https://japifon-backend.onrender.com/${id}`);
        setEvent(res.data);
        checkReservation(res.data);
      } catch (error) {
        setError('No se pudo cargar el evento');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

    async function checkReservation(res:any) {
      try {
        // const token = localStorage.getItem('token');
        // const res = await axios.get('http://localhost:3000/reservations/my', {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        const localEmail = localStorage.getItem("email");
        const existe = res.reservedBy.some((email: any) => email.email === localEmail);

        console.log(existe ? "Sí existe" : "No existe");
        // const reservedEventIds = res.reservedBy.map((r: any) => r.event._id);
        setHasReservation(existe);
      } catch (e) {
        console.error('Error verificando reserva');
      }
    }


  async function handleReserve() {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Enviando reserva con token:', token);
      await axios.post(
        `https://japifon-backend.onrender.com/reservations/${id}`,
        { eventId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHasReservation(true);
      if (event) {
        setEvent({ ...event, availableTickets: event.availableTickets - 1 });
      }
    } catch (err) {
      alert('Error al reservar');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://japifon-backend.onrender.com/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHasReservation(false);
      if (event) {
        setEvent({ ...event, availableTickets: event.availableTickets + 1 });
      }
    } catch (err) {
      alert('Error al cancelar reserva');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-700 font-semibold text-lg">Cargando evento...</p>
    );

  if (error)
    return (
      <p className="text-center mt-20 text-red-600 font-semibold text-lg">{error}</p>
    );

  if (!event)
    return (
      <p className="text-center mt-20 text-gray-700 font-semibold text-lg">Evento no encontrado.</p>
    );

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{event.title}</h1>

      <p className="mb-4 text-gray-700 leading-relaxed">{event.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="font-semibold text-gray-800">Fecha</h2>
          <p className="text-gray-600">
            {new Date(event.date).toLocaleString('es-MX', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800">Ubicación</h2>
          <p className="text-gray-600">{event.location}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800">Capacidad</h2>
          <p className="text-gray-600">{event.capacity}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800">Boletos disponibles</h2>
          <p className="text-gray-600">{event.availableTickets}</p>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        <p>Organizador: <span className="font-medium">{event.organizer}</span></p>
        <p>Creado el: {new Date(event.createdAt).toLocaleDateString('es-MX')}</p>
      </div>

      {userId && (
        <div className="mb-6">
          {hasReservation ? (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar Reserva'}
            </button>
          ) : event.availableTickets > 0 ? (
            <button
              onClick={handleReserve}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Reservando...' : 'Reservar'}
            </button>
          ) : (
            <p className="text-red-500 font-semibold">No hay boletos disponibles</p>
          )}
        </div>
      )}

      <Link
        href="/"
        className="inline-block px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        ← Regresar al inicio
      </Link>
    </main>
  );
}
