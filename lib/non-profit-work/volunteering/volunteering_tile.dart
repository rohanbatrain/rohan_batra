import 'package:flutter/material.dart';
import 'volunteering_screen.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class VolunteeringTile extends StatelessWidget {
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
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) => VolunteeringScreen(),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return ScaleTransition(
                      scale: Tween<double>(begin: 0.95, end: 1.0).animate(
                        CurvedAnimation(parent: animation, curve: Curves.easeInOut),
                      ),
                      child: child,
                    );
                  },
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListTile(
                leading: Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: Icon(
                    FontAwesomeIcons.handsHelping,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                title: Text(
                  'Volunteering',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? Colors.white : Colors.black,
                      ),
                ),
                subtitle: Text(
                  'Details about my volunteering experiences.',
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
