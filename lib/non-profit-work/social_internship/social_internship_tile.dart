import 'package:flutter/material.dart';
import 'social_internship_details_page.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SocialInternshipTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => SocialInternshipDetailsPage()),
        );
      },
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 4,
        margin: EdgeInsets.symmetric(vertical: 16),
        color: isDarkMode ? Colors.grey[900] : Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ListTile(
            leading: Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: Icon(
                FontAwesomeIcons.briefcase,
                color: isDarkMode ? Colors.white : Colors.black,
              ),
            ),
            title: Text(
              'Social Internship',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
            ),
            subtitle: Text(
              'Details about my social internship experiences.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isDarkMode ? Colors.white70 : Colors.black87,
                  ),
            ),
          ),
        ),
      ),
    );
  }
}
