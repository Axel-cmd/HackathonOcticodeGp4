import { prisma } from "../../../prisma/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const token = uuidv4();

    //1 heure à partir de maintenant
    const expires_at = new Date(Date.now() + 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        token,
        created_at: new Date(),
        expires_at,
        status: 1,
      },
    });

    return new Response(JSON.stringify({ token }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Session creation failed" }), {
      status: 500,
    });
  }
}
// Endpoint pour valider le QR Code
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Vérifier la date d'expiration et le statut de la session
    const now = new Date();
    if (session.expires_at < now || session.status !== 1) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Si la session est valide, retourner un succès
    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to validate session" }),
      {
        status: 500,
      }
    );
  }
}
