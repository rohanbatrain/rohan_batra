import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SocialsIndexPage extends StatefulWidget {
  @override
  _SocialsIndexPageState createState() => _SocialsIndexPageState();
}

class _SocialsIndexPageState extends State<SocialsIndexPage> {
  final Map<String, Map<String, dynamic>> socials = {
    'Instagram': {
      'icon': FontAwesomeIcons.instagram,
      'handles': ['@rohanbatrain', '@rohanbatrain_personal'],
    },
    'Twitter': {
      'icon': FontAwesomeIcons.twitter,
      'handles': ['@rohanbatrain', '@rohanbatrain_lens'],
    },
    'GitHub': {
      'icon': FontAwesomeIcons.github,
      'handles': ['@rohanbatrain'],
    },
  };

  Set<String> expandedTiles = {};

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('Socials'),
        backgroundColor: isDark ? theme.appBarTheme.backgroundColor ?? theme.primaryColor : Colors.white,
        iconTheme: IconThemeData(color: isDark ? Colors.white : Colors.black),
        titleTextStyle: theme.appBarTheme.titleTextStyle?.copyWith(color: isDark ? Colors.white : Colors.black) ?? TextStyle(color: isDark ? Colors.white : Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
      ),
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            Row(
              children: [
                Icon(
                  FontAwesomeIcons.userFriends,
                  size: 28,
                  color: isDark ? theme.primaryColor : Colors.black,
                ),
                SizedBox(width: 12),
                Text(
                  'Connect with Me',
                  style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 20),
            Text(
              'Username-wise',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Divider(thickness: 1.2, color: theme.dividerColor),
            SizedBox(height: 8),
            ...socials.entries.map((entry) {
              final isExpanded = expandedTiles.contains(entry.key);
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Card(
                  color: isDark ? Colors.grey[900] : Colors.white,
                  elevation: 2,
                  child: ExpansionTile(
                    leading: Icon(
                      entry.value['icon'],
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    title: Text(entry.key, style: theme.textTheme.titleMedium),
                    trailing: Icon(
                      isExpanded ? FontAwesomeIcons.chevronUp : FontAwesomeIcons.chevronDown,
                      color: isDark ? Colors.white : Colors.black,
                      size: 18,
                    ),
                    initiallyExpanded: isExpanded,
                    onExpansionChanged: (expanded) {
                      setState(() {
                        if (expanded) {
                          expandedTiles.add(entry.key);
                        } else {
                          expandedTiles.remove(entry.key);
                        }
                      });
                    },
                    children: [
                      ...List.generate(entry.value['handles'].length, (i) {
                        final handle = entry.value['handles'][i];
                        final displayHandle = handle.startsWith('@') ? handle.substring(1) : handle;
                        return ListTile(
                          leading: Icon(FontAwesomeIcons.at, size: 16, color: theme.iconTheme.color),
                          title: Text(displayHandle, style: theme.textTheme.bodyLarge),
                        );
                      })
                    ],
                  ),
                ),
              );
            }).toList(),
            SizedBox(height: 32),
            Text(
              'Project-wise',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Divider(thickness: 1.2, color: theme.dividerColor),
            SizedBox(height: 8),
            Card(
              color: isDark ? Colors.grey[900] : Colors.white,
              elevation: 2,
              child: ListTile(
                leading: Icon(FontAwesomeIcons.folderOpen, color: isDark ? Colors.white : Colors.black),
                title: Text('No project-based socials yet.', style: theme.textTheme.bodyLarge),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
