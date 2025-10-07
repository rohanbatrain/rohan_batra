/**
 * GitHub Sync Service
 * Handles synchronization with canonical "flashcards" repository
 *
 * Pattern: Single repo per org, pull-first sync, optional push-back
 */

import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import RepoSyncConfigModel from '@/models/RepoSyncConfig';
import { Types } from 'mongoose';

interface SyncResult {
  success: boolean;
  decksCreated: number;
  decksUpdated: number;
  cardsCreated: number;
  cardsUpdated: number;
  errors: string[];
}

interface DeckFile {
  path: string;
  content: string;
  sha: string;
}

/**
 * GitHub Sync Service
 */
export class GitHubSyncService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Pull decks from GitHub repository
   */
  async pullFromRepo(
    ownerId: Types.ObjectId,
    repoUrl: string,
    branch: string = 'main'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      decksCreated: 0,
      decksUpdated: 0,
      cardsCreated: 0,
      cardsUpdated: 0,
      errors: [],
    };

    try {
      // Parse repo URL
      const { owner, repo } = this.parseRepoUrl(repoUrl);

      // Get or create sync config
      let syncConfig = await RepoSyncConfigModel.findOne({
        ownerId,
        repoUrl,
      });

      if (!syncConfig) {
        syncConfig = new RepoSyncConfigModel({
          ownerId,
          repoUrl,
          repoOwner: owner,
          repoName: repo,
          defaultBranch: branch,
          syncDirection: 'pull-only',
          status: 'active',
          authType: 'oauth',
        });
        await syncConfig.save();
      }

      // Fetch deck files from repo
      const deckFiles = await this.fetchDeckFiles(owner, repo, branch);

      // Process each deck file
      for (const file of deckFiles) {
        try {
          const deckResult = await this.processDeckFile(
            ownerId,
            file,
            syncConfig._id
          );

          result.decksCreated += deckResult.deckCreated ? 1 : 0;
          result.decksUpdated += deckResult.deckUpdated ? 1 : 0;
          result.cardsCreated += deckResult.cardsCreated;
          result.cardsUpdated += deckResult.cardsUpdated;
        } catch (error) {
          result.errors.push(
            `Error processing ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Update sync config
      syncConfig.lastSyncAt = new Date();
      syncConfig.lastSyncStatus =
        result.errors.length === 0 ? 'success' : 'partial';
      await syncConfig.save();

      result.success = true;
      return result;
    } catch (error) {
      result.errors.push(
        `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return result;
    }
  }

  /**
   * Push decks to GitHub repository
   * Note: Only available when syncDirection is 'push-pull'
   */
  async pushToRepo(
    ownerId: Types.ObjectId,
    repoUrl: string,
    branch: string = 'main'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      decksCreated: 0,
      decksUpdated: 0,
      cardsCreated: 0,
      cardsUpdated: 0,
      errors: [],
    };

    try {
      // Get sync config
      const syncConfig = await RepoSyncConfigModel.findOne({
        ownerId,
        repoUrl,
      });

      if (!syncConfig) {
        throw new Error('Sync config not found. Run pull first.');
      }

      if (syncConfig.syncDirection === 'pull-only') {
        throw new Error('Push is disabled for pull-only sync direction');
      }

      const { owner, repo } = this.parseRepoUrl(repoUrl);

      // Get all decks for owner
      const decks = await FlashcardDeckModel.find({ ownerId }).lean();

      // Push each deck
      for (const deck of decks) {
        try {
          const pushed = await this.pushDeckToRepo(
            owner,
            repo,
            branch,
            deck,
            syncConfig
          );

          if (pushed) {
            result.decksUpdated++;
          }
        } catch (error) {
          result.errors.push(
            `Error pushing deck ${deck.slug}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Update sync config
      syncConfig.lastSyncAt = new Date();
      syncConfig.lastSyncStatus =
        result.errors.length === 0 ? 'success' : 'partial';
      await syncConfig.save();

      result.success = true;
      return result;
    } catch (error) {
      result.errors.push(
        `Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return result;
    }
  }

  /**
   * Parse GitHub repo URL
   */
  private parseRepoUrl(url: string): { owner: string; repo: string } {
    // Support formats:
    // - https://github.com/owner/repo
    // - git@github.com:owner/repo.git
    // - owner/repo

    let match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }

    match = url.match(/^([^/]+)\/([^/]+)$/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }

    throw new Error(`Invalid GitHub repo URL: ${url}`);
  }

  /**
   * Fetch all deck files from repository
   */
  private async fetchDeckFiles(
    owner: string,
    repo: string,
    branch: string
  ): Promise<DeckFile[]> {
    const deckFiles: DeckFile[] = [];

    try {
      // Get contents of decks directory
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'decks',
        ref: branch,
      });

      if (!Array.isArray(contents)) {
        return deckFiles;
      }

      // Process each file
      for (const item of contents) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          // Fetch file content
          const { data: file } = await this.octokit.repos.getContent({
            owner,
            repo,
            path: item.path,
            ref: branch,
          });

          if ('content' in file && file.content) {
            const content = Buffer.from(file.content, 'base64').toString(
              'utf-8'
            );
            deckFiles.push({
              path: item.path,
              content,
              sha: file.sha,
            });
          }
        }
      }

      return deckFiles;
    } catch (error) {
      if ((error as any).status === 404) {
        // decks directory doesn't exist, return empty
        return deckFiles;
      }
      throw error;
    }
  }

  /**
   * Process a single deck file
   */
  private async processDeckFile(
    ownerId: Types.ObjectId,
    file: DeckFile,
    syncConfigId: Types.ObjectId
  ): Promise<{
    deckCreated: boolean;
    deckUpdated: boolean;
    cardsCreated: number;
    cardsUpdated: number;
  }> {
    // Parse frontmatter
    const { data: frontmatter, content: body } = matter(file.content);

    const slug =
      frontmatter.slug ||
      file.path.split('/').pop()?.replace('.md', '') ||
      'untitled';
    const title = frontmatter.title || slug;

    // Find or create deck
    let deck = await FlashcardDeckModel.findOne({ ownerId, slug });
    const isNew = !deck;

    if (!deck) {
      deck = new FlashcardDeckModel({
        slug,
        title,
        description: frontmatter.description,
        ownerId,
        tags: frontmatter.tags || [],
        categories: frontmatter.categories || [],
        status: frontmatter.status || 'draft',
        visibility: frontmatter.visibility || 'private',
        cardCount: 0,
      });
    } else {
      // Update existing deck
      deck.title = title;
      deck.description = frontmatter.description;
      deck.tags = frontmatter.tags || deck.tags;
      deck.categories = frontmatter.categories || deck.categories;
    }

    await deck.save();

    // Update path mapping in sync config
    await RepoSyncConfigModel.updateOne(
      { _id: syncConfigId },
      {
        $set: {
          [`pathMapping.${deck._id.toString()}`]: file.path,
        },
      }
    );

    // Parse cards from body
    const cards = this.parseCardsFromMarkdown(body);
    let cardsCreated = 0;
    let cardsUpdated = 0;

    // Process cards
    for (const cardData of cards) {
      // Try to find existing card by prompt text
      let card = await FlashcardCardModel.findOne({
        deckId: deck._id,
        'prompt.text': cardData.prompt.text,
      });

      if (!card) {
        // Create new card
        const lastCard = await FlashcardCardModel.findOne({ deckId: deck._id })
          .sort({ order: -1 })
          .lean();
        const nextOrder = (lastCard?.order || 0) + 1;

        card = new FlashcardCardModel({
          deckId: deck._id,
          type: cardData.type || 'basic',
          prompt: cardData.prompt,
          response: cardData.response,
          hint: cardData.hint,
          explanation: cardData.explanation,
          tags: cardData.tags || [],
          order: nextOrder,
        });
        cardsCreated++;
      } else {
        // Update existing card
        card.response = cardData.response;
        card.hint = cardData.hint;
        card.explanation = cardData.explanation;
        card.tags = cardData.tags || card.tags;
        cardsUpdated++;
      }

      await card.save();
    }

    // Update deck card count
    deck.cardCount = await FlashcardCardModel.countDocuments({
      deckId: deck._id,
    });
    await deck.save();

    return {
      deckCreated: isNew,
      deckUpdated: !isNew,
      cardsCreated,
      cardsUpdated,
    };
  }

  /**
   * Parse cards from markdown content
   */
  private parseCardsFromMarkdown(content: string): Array<{
    type: 'basic';
    prompt: { text: string };
    response: { text: string };
    hint?: string;
    explanation?: string;
    tags?: string[];
  }> {
    const cards: Array<any> = [];

    // Split by ## to find card blocks
    const cardBlocks = content.split(/\n##\s+/).filter(b => b.trim());

    for (const block of cardBlocks) {
      const lines = block.trim().split('\n');
      let prompt = '';
      let response = '';
      let hint = '';
      let explanation = '';
      let tags: string[] = [];
      let currentSection:
        | 'prompt'
        | 'response'
        | 'hint'
        | 'explanation'
        | null = null;

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) continue;

        // Section markers
        if (/^Q:|^Question:/i.test(trimmed)) {
          currentSection = 'prompt';
          prompt = trimmed.replace(/^Q:|^Question:/i, '').trim();
          continue;
        }
        if (/^A:|^Answer:/i.test(trimmed)) {
          currentSection = 'response';
          response = trimmed.replace(/^A:|^Answer:/i, '').trim();
          continue;
        }
        if (/^Hint:/i.test(trimmed)) {
          currentSection = 'hint';
          hint = trimmed.replace(/^Hint:/i, '').trim();
          continue;
        }
        if (/^Explanation:/i.test(trimmed)) {
          currentSection = 'explanation';
          explanation = trimmed.replace(/^Explanation:/i, '').trim();
          continue;
        }
        if (/^Tags:/i.test(trimmed)) {
          const tagString = trimmed.replace(/^Tags:/i, '').trim();
          tags = tagString
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
          continue;
        }

        // Append to current section
        if (currentSection === 'prompt') prompt += ' ' + trimmed;
        else if (currentSection === 'response') response += ' ' + trimmed;
        else if (currentSection === 'hint') hint += ' ' + trimmed;
        else if (currentSection === 'explanation') explanation += ' ' + trimmed;
      }

      if (prompt && response) {
        cards.push({
          type: 'basic',
          prompt: { text: prompt.trim() },
          response: { text: response.trim() },
          hint: hint.trim() || undefined,
          explanation: explanation.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      }
    }

    return cards;
  }

  /**
   * Push deck to GitHub repository
   */
  private async pushDeckToRepo(
    owner: string,
    repo: string,
    branch: string,
    deck: any,
    syncConfig: any
  ): Promise<boolean> {
    // Get cards for deck
    const cards = await FlashcardCardModel.find({ deckId: deck._id })
      .sort({ order: 1 })
      .lean();

    // Generate markdown content
    const content = this.generateDeckMarkdown(deck, cards);

    // Get file path from mapping or generate
    const filePath =
      syncConfig.pathMapping?.get(deck._id.toString()) ||
      `decks/${deck.slug}.md`;

    try {
      // Check if file exists
      let sha: string | undefined;
      try {
        const { data: existingFile } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch,
        });

        if ('sha' in existingFile) {
          sha = existingFile.sha;
        }
      } catch (error) {
        // File doesn't exist, will create
      }

      // Create or update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update deck: ${deck.title}`,
        content: Buffer.from(content).toString('base64'),
        branch,
        sha,
      });

      return true;
    } catch (error) {
      console.error(`Failed to push deck ${deck.slug}:`, error);
      return false;
    }
  }

  /**
   * Generate markdown content for deck
   */
  private generateDeckMarkdown(deck: any, cards: any[]): string {
    let content = '---\n';
    content += `title: ${deck.title}\n`;
    content += `slug: ${deck.slug}\n`;
    if (deck.description) content += `description: ${deck.description}\n`;
    if (deck.tags?.length) content += `tags: [${deck.tags.join(', ')}]\n`;
    if (deck.categories?.length)
      content += `categories: [${deck.categories.join(', ')}]\n`;
    content += `status: ${deck.status}\n`;
    content += `visibility: ${deck.visibility}\n`;
    content += '---\n\n';

    // Add cards
    cards.forEach((card, index) => {
      content += `## Card ${index + 1}\n\n`;
      content += `Q: ${card.prompt?.text || ''}\n\n`;
      content += `A: ${card.response?.text || ''}\n\n`;

      if (card.hint) {
        content += `Hint: ${card.hint}\n\n`;
      }

      if (card.explanation) {
        content += `Explanation: ${card.explanation}\n\n`;
      }

      if (card.tags?.length) {
        content += `Tags: ${card.tags.join(', ')}\n\n`;
      }

      content += '---\n\n';
    });

    return content;
  }
}

/**
 * Factory function to create sync service
 */
export function createGitHubSyncService(token: string): GitHubSyncService {
  return new GitHubSyncService(token);
}
