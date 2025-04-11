import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';
import 'repository_screens/branding_kit_screen.dart';
import 'repository_screens/configs_screen.dart';
import 'repository_screens/emotion_tracker_screen.dart';
import 'repository_screens/knowledge_base_screen.dart';
import 'repository_screens/landing_pages_screen.dart';
import 'repository_screens/portfolio_screen.dart';
import 'repository_screens/sbdfs_screen.dart';
import 'repository_screens/sbd_flutter_template_screen.dart';
import 'repository_screens/scripts_screen.dart';
import 'repository_screens/second_brain_2022_screen.dart';
import 'repository_screens/second_brain_tools_2022_screen.dart';
import 'repository_screens/second_brain_database_screen.dart';
import 'repository_screens/second_brain_database_telegram_bot_screen.dart';
import 'repository_screens/second_brain_database_flutter_frontend_screen.dart';
import 'repository_screens/suckless_dmenu_screen.dart';
import 'repository_screens/suckless_dwm_screen.dart';
import 'repository_screens/suckless_st_screen.dart';

class OpenSourceDetailsScreen extends StatelessWidget {
  final List<String> repositories = [
    'branding-kit',
    'configs',
    'emotion_tracker',
    'knowledge-base',
    'landing-pages',
    'Portfolio',
    'sbdfs',
    'sbd_flutter_template',
    'scripts',
    'second-brain-2022',
    'second-brain-tools-2022',
    'second_brain_database',
    'second_brain_database_telegram_bot',
    'second_brain_database_flutter_frontend',
    'suckless-dmenu',
    'suckless-dwm',
    'suckless-st',
  ];

  final Map<String, bool> featuredRepositories = {
    'branding-kit': true,
    'configs': false,
    'emotion_tracker': true,
    'knowledge-base': true,
    'landing-pages': false,
    'Portfolio': false,
    'sbdfs': false,
    'sbd_flutter_template': false,
    'scripts': false,
    'second-brain-2022': true,
    'second-brain-tools-2022': false,
    'second_brain_database': false,
    'second_brain_database_bot_telegram_template': false,
    'second_brain_database_flutter_frontend': false,
    'suckless-dmenu': false,
    'suckless-dwm': false,
    'suckless-st': false,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color;
    final urlColor = theme.colorScheme.secondary;
    final buttonColor = theme.colorScheme.primary;

    // Sort repositories based on featured status
    final sortedRepositories = List<String>.from(repositories)
      ..sort((a, b) {
        final isAFeatured = featuredRepositories[a] ?? false;
        final isBFeatured = featuredRepositories[b] ?? false;
        return (isBFeatured ? 1 : 0).compareTo(isAFeatured ? 1 : 0);
      });

    return Scaffold(
      appBar: AppBar(
        title: Text('Open Source Contributions'),
        elevation: 2,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft), // Added leading arrow
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
        itemCount: sortedRepositories.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final repository = sortedRepositories[index];
          final url = 'https://github.com/rohanbatrain/$repository';
          return Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20.0),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(20.0),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) {
                      switch (repository) {
                        case 'branding-kit':
                          return BrandingKitScreen();
                        case 'configs':
                          return ConfigsScreen();
                        case 'emotion_tracker':
                          return EmotionTrackerScreen();
                        case 'knowledge-base':
                          return KnowledgeBaseScreen();
                        case 'landing-pages':
                          return LandingPagesScreen();
                        case 'Portfolio':
                          return PortfolioScreen();
                        case 'sbdfs':
                          return SbdfsScreen();
                        case 'sbd_flutter_template':
                          return SbdFlutterTemplateScreen();
                        case 'scripts':
                          return ScriptsScreen();
                        case 'second-brain-2022':
                          return SecondBrain2022Screen();
                        case 'second-brain-tools-2022':
                          return SecondBrainTools2022Screen();
                        case 'second_brain_database':
                          return SecondBrainDatabaseScreen();
                        case 'second_brain_database_telegram_bot':
                          return SecondBrainDatabaseTelegramBotScreen();
                        case 'second_brain_database_flutter_frontend':
                          return SecondBrainDatabaseFlutterFrontendScreen();
                        case 'suckless-dmenu':
                          return SucklessDmenuScreen();
                        case 'suckless-dwm':
                          return SucklessDwmScreen();
                        case 'suckless-st':
                          return SucklessStScreen();
                        default:
                          return Scaffold(
                            appBar: AppBar(title: Text('Unknown Repository')),
                            body: Center(child: Text('No screen available for $repository')),
                          );
                      }
                    },
                  ),
                );
              },
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: buttonColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(12),
                      child: FaIcon(
                        FontAwesomeIcons.github,
                        size: 24,
                        color: buttonColor,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            sortedRepositories[index],
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            url,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: urlColor,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (featuredRepositories[repository] ?? false)
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0),
                        child: Text(
                          'Featured',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    IconButton(
                      icon: FaIcon(FontAwesomeIcons.copy, color: buttonColor),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: url));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('URL copied to clipboard!'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
