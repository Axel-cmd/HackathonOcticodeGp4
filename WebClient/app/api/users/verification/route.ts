import io from "@/app/socketServer";
import { prisma } from "../../../../prisma/db";
import jwt from "jsonwebtoken";

const secret = ""; // Remplacez par votre clé secrète JWT

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    io.emit("redirect", { url: "/app" });

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
