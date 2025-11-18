import { revalidatePath } from 'next/cache';

export function revalidateAll() {
    revalidatePath('/', 'layout');
}