import { getSiteContent as getSiteContentFromDb } from '@/lib/db';
import type { ContentData } from '@/types/portfolio';

export function getSiteContent(): ContentData {
  return getSiteContentFromDb();
}
