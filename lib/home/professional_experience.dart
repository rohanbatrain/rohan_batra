import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_animate/flutter_animate.dart'; // Import the animate package
import 'package:rohanbatra/professional-experience/index.dart';

class ProfessionalExperience extends StatelessWidget {
  final bool isDarkMode;

  const ProfessionalExperience({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 700;
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 20 : 60,
        vertical: isMobile ? 20 : 30,
      ),
      child: isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(
                  height: 250,
                  child: Lottie.asset(
                    'assets/animations/experience.json',
                    fit: BoxFit.contain,
                  ),
                ),
                SizedBox(height: 32),
                Text(
                  'Professional Experience',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
                SizedBox(height: 15),
                Text(
                  'I have worked on various startups—some that have concluded and others that are still ongoing. '
                  'These ventures led to numerous projects, many of which are open-source and publicly available. '
                  'My experience reflects a hands-on journey through building, learning, and sharing across different domains.',
                  style: TextStyle(
                    fontSize: 18,
                    height: 1.6,
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
                  ),
                  textAlign: TextAlign.center,
                ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2),
                SizedBox(height: 25),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ProfessionalExperienceIndexPage(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDarkMode ? Colors.white : Colors.black,
                    foregroundColor: isDarkMode ? Colors.black : Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 25, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text('View More'),
                ).animate().fadeIn(duration: 900.ms).slideY(begin: 0.2),
              ],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
          // Left Side: Text
          Expanded(
            flex: 6,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Professional Experience',
                  style: TextStyle(
                    fontSize: 32, // Increased font size
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2), // Add fade and slide animation
                SizedBox(height: 15), // Adjusted spacing
                Text(
'I have worked on various startups—some that have concluded and others that are still ongoing. '
'These ventures led to numerous projects, many of which are open-source and publicly available. '
'My experience reflects a hands-on journey through building, learning, and sharing across different domains.',
                  style: TextStyle(
                    fontSize: 18,
                    height: 1.6, // Improved line height for readability
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
                  ),
                ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2), // Add fade and slide animation
                SizedBox(height: 25), // Adjusted spacing
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ProfessionalExperienceIndexPage(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDarkMode ? Colors.white : Colors.black,
                    foregroundColor: isDarkMode ? Colors.black : Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 25, vertical: 14), // Adjusted padding
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10), // Slightly rounded corners
                    ),
                  ),
                  child: Text('View More'),
                ).animate().fadeIn(duration: 900.ms).slideY(begin: 0.2), // Add fade and slide animation
              ],
            ),
          ),

          SizedBox(width: 60), // Increased spacing between text and animation

          // Right Side: Lottie Animation
          Expanded(
            flex: 4,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final maxHeight = constraints.maxHeight * 0.85; // Slightly zoom in
                return ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: maxHeight,
                    maxWidth: maxHeight, // Maintain aspect ratio
                  ),
                  child: Lottie.asset(
                    'assets/animations/experience.json', // Replace with your Lottie animation
                    fit: BoxFit.contain,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
