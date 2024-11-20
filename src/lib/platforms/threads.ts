import { connectInstagram } from './instagram';

export async function connectThreads() {
  // Threads uses Instagram's authentication
  await connectInstagram();
  // Store additional flag for Threads connection
  localStorage.setItem('connect_threads', 'true');
}