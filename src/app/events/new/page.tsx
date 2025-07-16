'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para crear eventos.');
      return;
    }

    if (
      !form.title ||
      !form.description ||
      !form.date ||
      !form.location ||
      !form.capacity
    ) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const capacity = Number(form.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      setError('La capacidad debe ser un número mayor a 0');
      return;
    }

    try {
      await axios.post(
        'https://japifon-backend.onrender.com/events',
        {
          title: form.title,
          description: form.description,
          date: new Date(form.date),
          location: form.location,
          capacity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push('/');
    } catch (err: any) {
      setError('Ocurrió un error al crear el evento.');
      console.error(err);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Crear nuevo evento
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label className="block font-semibold mb-1">Título</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Ubicación</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Capacidad</label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Crear evento
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
