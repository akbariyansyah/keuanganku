import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

type RegisterBody = {
  email?: string;
  fullname?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
};

const REQUIRED_FIELDS: Array<keyof RegisterBody> = ["email", "username","fullname", "password", "confirm_password"];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody;
    const missingField = REQUIRED_FIELDS.find((field) => {
      const value = body[field];
      return typeof value !== "string" || !value.trim();
    });

    if (missingField) {
      return Response.json({ error: `${missingField.replace("_", " ")} is required` }, { status: 400 });
    }

    const email = body.email!.trim().toLowerCase();
    const fullname = body.fullname!.trim();
    const username = body.username!.trim();
    const password = body.password!.trim();
    const confirmPassword = body.confirm_password!.trim();

    if (password !== confirmPassword) {
      return Response.json({ error: "Password and confirmation do not match" }, { status: 400 });
    }

    const duplicateQuery = await pool.query<{ email: string; username: string }>(
      `SELECT email, username
       FROM users
       WHERE LOWER(email) = LOWER($1)
          OR LOWER(username) = LOWER($2)
       LIMIT 1`,
      [email, username.toLowerCase()]
    );

    const duplicate = duplicateQuery.rows[0];
    if (duplicate) {
      const isEmailTaken = duplicate.email.toLowerCase() === email;
      const isUsernameTaken = duplicate.username.toLowerCase() === username.toLowerCase();

      const errorMessage = isEmailTaken && isUsernameTaken
        ? "Email and username are already registered"
        : isEmailTaken
          ? "Email is already registered"
          : "Username is already taken";

      return Response.json({ error: errorMessage }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastIdQuery = await pool.query(
      "SELECT MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)) AS last_id_num FROM users;"
    );
    const newIdNumber = (lastIdQuery.rows[0].last_id_num || 0) + 1;
    const id = "USR-" + String(newIdNumber).padStart(3, "0");

    const query = `
        INSERT INTO users (id, email,fullname, username, password)
        VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username`;

    const values = [
      id,
      email,
      fullname,
      username,
      hashedPassword,
    ];

    const { rows } = await pool.query<{
      id: string;
      email: string;
      fullname: string;
      username: string;
    }>(query, values);

    return Response.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("register error:", err);
    return Response.json({ error: `Invalid request body ${err}` }, { status: 400 });
  }
}
