import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'e_cell_page.dart'; // Import the new screen

class ECellCard extends StatelessWidget {
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
            'assets/logos/IITB/ECELL/ecell_iitb_logo.jpg',
            height: 50,
            width: 50,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Icon(Icons.lightbulb, size: 50);
            },
          ),
        ),
        title: Text(
          'E-Cell, IIT Bombay',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        subtitle: Text(
          'Competed and participated in entrepreneurship and innovation workshops.\n2021 - 2022',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ECellPage()),
          );
        },
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2);
  }
}
