import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ShadowBoxingTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: AnimatedScale(
        duration: Duration(milliseconds: 200),
        scale: 1.0,
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 4,
          margin: EdgeInsets.symmetric(vertical: 16),
          color: isDarkMode ? Colors.grey[900] : Colors.white,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            splashColor: isDarkMode ? Colors.white24 : Colors.black12,
            onTap: () {
              // Add navigation or functionality for Shadow Boxing
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListTile(
                leading: Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: Icon(
                    FontAwesomeIcons.fistRaised,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                title: Text(
                  'Shadow Boxing',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? Colors.white : Colors.black,
                      ),
                ),
                subtitle: Text(
                  'Practicing agility and focus through shadow boxing.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: isDarkMode ? Colors.white70 : Colors.black87,
                      ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
