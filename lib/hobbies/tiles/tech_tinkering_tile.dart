import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class TechTinkeringTile extends StatelessWidget {
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
              // Add navigation or functionality for Tech Tinkering
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListTile(
                leading: Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: Icon(
                    FontAwesomeIcons.tools,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                title: Text(
                  'Tech Tinkering',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? Colors.white : Colors.black,
                      ),
                ),
                subtitle: Text(
                  'Exploring and experimenting with gadgets, software, and hardware.',
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
