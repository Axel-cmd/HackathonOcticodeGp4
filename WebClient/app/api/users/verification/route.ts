import io from "@/socketServer";
import { prisma } from "../../../../prisma/db";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { sessionToken, token } = await request.json();

    if (!sessionToken || !token) {
      return new Response(
        JSON.stringify({ error: "Token and session are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Décoder le token JWT
    let decoded: any;
    try {
      decoded = jwt.decode(token);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(decoded);

    // Vérifier les informations utilisateur
    const { email } = decoded;

    if (!email) {
      return new Response(JSON.stringify({ error: "Token is missing email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rechercher la session par sessionToken
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Vérifier si la session est valide
    const now = new Date();
    if (session.expires_at < now || session.status !== 1) {
      return new Response(
        JSON.stringify({ error: "Session is invalid or expired" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    io.emit("redirect", {
      url: "/app",
      sessionToken: sessionToken,
    });

    // Retourner les informations de l'utilisateur
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Token validation failed" }), {
      status: 500,
    });
  }
}
