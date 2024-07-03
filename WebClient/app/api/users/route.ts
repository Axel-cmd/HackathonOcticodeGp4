import { prisma } from "../../../prisma/db";

export async function POST(request: Request) {
  try {
    const { name, email, role, code } = await request.json();

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        role: role,
        code: code,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "User creation failed" }), {
      status: 500,
    });
  }
}
