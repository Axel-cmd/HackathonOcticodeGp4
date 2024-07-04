"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import Loading from '@/components/loading';
import { io, Socket } from 'socket.io-client';
import { cookies } from "next/headers";

interface SessionResponse {
  token: string;
}

interface RedirectData {
  url: string;
  sessionToken: string;
  userName: string;
  userEmail: string;
}

export default function Qr() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const cookieStore = cookies();
  const port = cookieStore.get('port');
  const socket: Socket = io(`${process.env.BASE_URL}:${port}`); 

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        setToken(data.token);
        console.log(data.token);
        
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching the token:', error);
        setLoading(false);
      }
    }
  
    fetchToken();
  
    return () => {
      console.log('Component unmounted');
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  useEffect(() => {
    // Effect to set up socket listener for 'redirect' events
    socket.on('redirect', (data: RedirectData) => {
      if (data && data.url && data.sessionToken === token) {
        // Append userName and userEmail to the URL
        const urlWithParams = `${data.url}?userName=${encodeURIComponent(data.userName)}&userEmail=${encodeURIComponent(data.userEmail)}`;
        router.push(urlWithParams);
  
        setTimeout(() => {
          console.log('Navigation successful, closing socket.');
          socket.close();              
        }, 5000);
      } else {
        console.error('Invalid redirect data received from Socket.IO');
        socket.close();
      }
    });
       
    // Clean up function for socket listener (runs on unmount)
    return () => {
      socket.off('redirect');
      socket.close();
      console.log('Component unmounted, socket closed');
    };
  }, [router, socket, token]); // Depend on router, socket, and token changes
  
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
