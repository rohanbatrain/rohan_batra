import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'orange_education_page.dart'; // Import the new screen

class OrangeEducationCard extends StatelessWidget {
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
            'assets/logos/Orange-Education/orangeeducation_logo.jpg',
            height: 50,
            width: 50,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Icon(Icons.palette, size: 50);
            },
          ),
        ),
        title: Text(
          'Orange Education',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        subtitle: Text(
          'Participated in creative and design-oriented workshops.\n2014 - 2015',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => OrangeEducationPage()),
          );
        },
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2);
  }
}
