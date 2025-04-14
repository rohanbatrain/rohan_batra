import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'indian-armed-forces/indian_armed_forces_tile.dart';
import 'indian-armed-forces/indian_armed_forces_screen.dart'; // Import the new screen

class CommunityEducationDetailsScreen extends StatelessWidget {
  final List<String> topics = [
    'Indian Armed Forces',
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Community Education',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 2,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Community Education',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              'These are the organizations where I delivered free community education in the form of seminars, workshops, and non-profit initiatives to help raise awareness and make a positive impact.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            // List of topics
            ListView.separated(
              shrinkWrap: true,  // Ensures it doesn’t take up unnecessary space
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              itemCount: topics.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final topic = topics[index];
                if (topic == 'Indian Armed Forces') {
                  return IndianArmedForcesTile(
                    onTap: () => Navigator.of(context).push(
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            const IndianArmedForcesScreen(),
                        transitionsBuilder: (context, animation, secondaryAnimation, child) {
                          const begin = 0.95;
                          const end = 1.0;
                          const curve = Curves.easeInOut;

                          var tween = Tween(begin: begin, end: end).chain(
                            CurveTween(curve: curve),
                          );
                          var scaleAnimation = animation.drive(tween);

                          return ScaleTransition(
                            scale: scaleAnimation,
                            child: child,
                          );
                        },
                      ),
                    ),
                  );
                }
                return const SizedBox();
              },
            ),
          ],
        ),
      ),
    );
  }
}
