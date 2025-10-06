#!/bin/bash

# Fix all async params issues in API routes and pages for Next.js 15

# API Routes - Fix pattern: { params }: { params: { ... } } 
# to: props: { params: Promise<{ ... }> } and add const params = await props.params;

echo "Fixing async params in API routes and pages..."

# Fix flashcards/[deckId]/route.ts
file="src/app/api/admin/flashcards/[deckId]/route.ts"
if [ -f "$file" ]; then
  sed -i '' 's/{ params }: { params: { deckId: string } }/props: { params: Promise<{ deckId: string }> }/g' "$file"
  # Add await params after function opening
  sed -i '' '/props: { params: Promise<{ deckId: string }> }/a\
  const params = await props.params;
' "$file"
fi

# Fix flashcards/[deckId]/cards/route.ts
file="src/app/api/admin/flashcards/[deckId]/cards/route.ts"
if [ -f "$file" ]; then
  sed -i '' 's/{ params }: { params: { deckId: string } }/props: { params: Promise<{ deckId: string }> }/g' "$file"
fi

# Fix flashcards/[deckId]/cards/[cardId]/route.ts
file="src/app/api/admin/flashcards/[deckId]/cards/[cardId]/route.ts"
if [ -f "$file" ]; then
  sed -i '' 's/{ params }: { params: { deckId: string; cardId: string } }/props: { params: Promise<{ deckId: string; cardId: string }> }/g' "$file"
fi

# Fix tryhackme routes
file="src/app/api/admin/tryhackme/rooms/[id]/route.ts"
if [ -f "$file" ]; then
  sed -i '' 's/{ params }: { params: { id: string } }/props: { params: Promise<{ id: string }> }/g' "$file"
fi

file="src/app/api/admin/tryhackme/badges/[id]/route.ts"
if [ -f "$file" ]; then
  sed -i '' 's/{ params }: { params: { id: string } }/props: { params: Promise<{ id: string }> }/g' "$file"
fi

echo "Done!"
