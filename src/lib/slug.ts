export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  let candidate = slugify(base) || 'item';
  if (!(await isTaken(candidate))) return candidate;
  let n = 2;
  while (await isTaken(`${candidate}-${n}`)) n++;
  return `${candidate}-${n}`;
}
