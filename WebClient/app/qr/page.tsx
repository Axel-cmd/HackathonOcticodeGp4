"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import Loading from '@/components/loading';
import socket from '../socket';

interface SessionResponse {
  token: string;
}

export default function Qr() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/sessions');
        const data: SessionResponse = await response.json();
        setToken(data.token);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching the token:', error);
        setLoading(false);
      }
    }

    fetchToken();

    socket.on('redirect', (data: { url: string }) => {
        console.log(data.url);
        
      router.push(data.url);
    });

    return () => {
      socket.off('redirect');
    };
  }, [router]);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/sessions');
        const data: SessionResponse = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching the token:', error);
      }
    }

    fetchToken();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl mb-8">Votre Code QR</h1>
      {loading ? (
        <Loading />
      ) : (
        token ? (
          <QRCode value={token} size={256} />
        ) : (
          <p>Erreur lors du chargement du code QR.</p>
        )
      )}
    </main>
  );
}
