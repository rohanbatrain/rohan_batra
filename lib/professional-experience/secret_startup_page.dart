import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart'; // Import FontAwesome for icons

class SecretStartupPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Top Secret Startup'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft), // Updated to FontAwesome icon
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Shhh... It\'s a Secret!',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 16),
            Text(
              'You\'ve stumbled upon something truly enigmatic. This startup is so secretive that even its name is classified. '
              'I\'ve been working on this mysterious project for years, crafting something that will leave the world in awe. '
              'Stay tuned... or maybe not. Secrets are best kept hidden.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 24),
            Center(
              child: Icon(
                FontAwesomeIcons.userNinja, // A more mischievous icon
                size: 100,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
