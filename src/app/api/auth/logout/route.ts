import { cookies } from 'next/headers';

export async function POST() {
  const cookiesStore = await cookies();
  cookiesStore.delete('token');
  return Response.json(
    { ok: true, message: 'Logout successfully' },
    { status: 200 },
  );
}
