import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Asset from '@/models/Asset';

type AssetToken = {
  raw: string;
  key: string;
};

const shortcodePattern = /\[asset:([^\]]+)\]/gi;

async function lookupAsset(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return null;

  if (Types.ObjectId.isValid(trimmed)) {
    const asset = await Asset.findById(trimmed);
    if (asset) return asset.url;
  }

  const asset = await Asset.findOne({
    $or: [
      { filename: trimmed },
      { originalFilename: trimmed },
      { url: trimmed },
      { 'metadata.alias': trimmed },
    ],
  });

  return asset?.url ?? null;
}

export async function resolveAssetShortcodes(value?: string | null) {
  if (!value) return value ?? '';

  const tokens: AssetToken[] = [];
  let match: RegExpExecArray | null;
  while ((match = shortcodePattern.exec(value)) !== null) {
    tokens.push({ raw: match[0], key: match[1] });
  }

  if (tokens.length === 0) return value;

  await connectToDatabase();

  const replacements = await Promise.all(
    tokens.map(async token => ({ token, url: await lookupAsset(token.key) }))
  );

  let resolved = value;
  for (const replacement of replacements) {
    if (replacement.url) {
      resolved = resolved.replace(replacement.token.raw, replacement.url);
    }
  }

  return resolved;
}

export async function resolveAssetShortcodesInArray(
  values?: (string | null | undefined)[]
) {
  if (!values) return [];
  const result: string[] = [];
  for (const value of values) {
    const resolved = await resolveAssetShortcodes(value ?? undefined);
    if (resolved) {
      result.push(resolved);
    }
  }
  return result;
}
