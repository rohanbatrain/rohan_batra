import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'sof_page.dart'; // Import the new screen

class SOFCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 4,
      margin: EdgeInsets.symmetric(vertical: 12),
      child: ListTile(
        contentPadding: EdgeInsets.all(16),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.asset(
            'assets/logos/Science-Olympiad-Foundation/logo.jpg',
            height: 50,
            width: 50,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Icon(Icons.lightbulb, size: 50);
            },
          ),
        ),
        title: Text(
          'Science Olympiad Foundation',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        subtitle: Text(
          'Participated in various Olympiads and achieved distinctions.\n2013 - 2018',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => SOFPage()),
          );
        },
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2);
  }
}
