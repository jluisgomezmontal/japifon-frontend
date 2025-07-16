'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('https://japifon-backend.onrender.com/auth/register', { email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
        <nav className="p-6 flex gap-4 justify-center">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <Link href="/login" className="text-blue-600 hover:underline">Iniciar sesión</Link>
        </nav>
    </main>
  );
}
