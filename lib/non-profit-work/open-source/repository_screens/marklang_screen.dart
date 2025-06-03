import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class MarklangScreen extends StatelessWidget {
  const MarklangScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Marklang'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Builder(
              builder: (context) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                final bannerAsset = isDark
                    ? 'assets/images/banners/marklang/2.png'
                    : 'assets/images/banners/marklang/1.png';
                return Padding(
                  padding: const EdgeInsets.all(20),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: SizedBox(
                      width: double.infinity,
                      height: 200,
                      child: Image.asset(
                        bannerAsset,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                );
              },
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  Text(
                    '📚 MarkLang',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'MarkLang is a robust, production-ready CLI tool for translating Hugo Markdown blog posts (including frontmatter, tags, and categories) from one language to another. It supports custom per-language dictionaries, Google Translate, and offline transliteration for technical terms and proper nouns.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Theme.of(context).hintColor),
                  ),
                  const SizedBox(height: 28),
                  Text('✨ Features:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• CLI-based: Translate files with a single command.'),
                        Text('• Frontmatter Support: Translates title, description, tags, categories, and more.'),
                        Text('• Custom Dictionary: Per-language CSV files for preferred translations of tags/categories.'),
                        Text('• Google Translate Fallback: Uses Google Translate for tags/categories if not found in the dictionary.'),
                        Text('• Offline Transliteration: For technical terms, falls back to script transliteration (e.g., Devanagari for Hindi).'),
                        Text('• Robust Logging: Detailed logs for every step, including dictionary usage and translation fallbacks.'),
                        Text('• Production-Ready: Modular, type-annotated, and well-documented code.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('🛠️ How It Works:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('1. Input: You provide a Markdown file with YAML frontmatter (e.g., en/blog/example.md).'),
                        Text('2. Translation: The script translates the title, description, tags, categories, and content to the target language.'),
                        Text('3. Custom Dictionary: For tags/categories, it first checks a per-language CSV (e.g., translations_hi.csv).'),
                        Text('4. Fallbacks: If not found, it uses Google Translate; if that fails, it uses offline transliteration.'),
                        Text('5. Output: The translated file is written to the corresponding target language directory (e.g., hi/blog/example.md).'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('📦 Installation:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  Text('Clone the repository:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('git clone https://github.com/rohanbatrain/MarkLang\ncd MarkLang'),
                  const SizedBox(height: 14),
                  Text('Install dependencies:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('pip install -r requirements.txt'),
                  const SizedBox(height: 14),
                  Text('For Hindi/Thai transliteration, also install:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('pip install indic-transliteration aksharamukha'),
                  const SizedBox(height: 28),
                  Text('▶️ Usage:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _CodeBlock('python main.py <input_file> <target_lang> [--source_lang en] [--model llama3.2:3b]'),
                  const SizedBox(height: 10),
                  const Text('<input_file>: Path to the input Markdown file (with frontmatter)'),
                  const Text('<target_lang>: Target language code (e.g., hi, fr, de)'),
                  const Text('--source_lang: Source language code (default: en)'),
                  const Text('--model: Translation model to use (default: llama3.2:3b)'),
                  const SizedBox(height: 10),
                  Text('Example:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('python main.py en/blog/example.md hi'),
                  const SizedBox(height: 10),
                  const Text('This will create hi/blog/example.md with all content translated to Hindi.'),
                  const SizedBox(height: 28),
                  Text('📚 Custom Dictionary:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('Place per-language CSVs in the translations/ directory, e.g., translations_hi.csv, translations_fr.csv.'),
                  const Text('Each CSV should have columns: word,translation'),
                  const SizedBox(height: 6),
                  _CodeBlock('word,translation\nAutomation,ऑटोमेशन\nLinux,लिनक्स\nSSH,एसएसएच'),
                  const SizedBox(height: 10),
                  const Text('The script will always check the dictionary first for tags/categories.'),
                  const SizedBox(height: 28),
                  Text('🛠️ How It Was Made:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('• Initial Version: Focused on translating titles/descriptions using a translation API.'),
                  const Text('• Enhancements:'),
                  Padding(
                    padding: const EdgeInsets.only(left: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('– Added support for arrays (tags/categories) and batch translation.'),
                        Text('– Implemented robust error handling and logging.'),
                        Text('– Added custom dictionary support and offline transliteration.'),
                        Text('– Refactored for CLI usage and production-readiness.'),
                      ],
                    ),
                  ),
                  const Text('• Fallback Logic: Always tries dictionary → Google Translate → offline transliteration.'),
                  const Text('• Validation: Ensures frontmatter is valid and all keys have values.'),
                  const Text('• Extensible: Easy to add new languages or extend dictionary files.'),
                  const SizedBox(height: 28),
                  Text('🌐 Supported Languages:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• English (en)'),
                        Text('• Hindi (hi)'),
                        Text('• French (fr)'),
                        Text('• German (de)'),
                        Text('• Italian (it)'),
                        Text('• Portuguese (pt)'),
                        Text('• Spanish (es)'),
                        Text('• Thai (th)'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('📝 Logging & Troubleshooting:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('• All major steps are logged to the console.'),
                  const Text('• Errors in translation, dictionary loading, or file writing are clearly reported.'),
                  const Text('• If a translation fails, the script falls back gracefully and logs the fallback used.'),
                  const SizedBox(height: 28),
                  Text('🤝 Contributing:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('• PRs are welcome! Please add tests for new features.'),
                  const Text('• For new languages, add a translations_<lang>.csv file in the translations/ directory.'),
                  const SizedBox(height: 28),
                  Text('📄 License:', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('MIT License'),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Helper widget for code blocks
class _CodeBlock extends StatelessWidget {
  final String code;
  const _CodeBlock(this.code);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 2),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF23272F) : const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? const Color(0xFF444A54) : const Color(0xFFE0E0E0),
        ),
      ),
      child: SelectableText(
        code,
        style: TextStyle(
          fontFamily: 'monospace',
          fontSize: 15,
          color: isDark ? Colors.white : Colors.black,
        ),
      ),
    );
  }
}
