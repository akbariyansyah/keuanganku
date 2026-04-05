import { cookies } from 'next/headers';
import { sendSuccess } from '@/lib/api-response';

export async function POST() {
  const cookiesStore = await cookies();
  cookiesStore.delete('token');
  return sendSuccess(null, 'Logout successfully');
}
