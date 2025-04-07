import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class ProfessionalExperience extends StatelessWidget {
  final bool isDarkMode;

  const ProfessionalExperience({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 60, vertical: 30), // Increased padding
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start, // Align items to the top
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Distribute space evenly
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
                ),
                SizedBox(height: 15), // Adjusted spacing
                Text(
                  'I have worked on various projects as a developer, writer, and researcher. '
                  'My experience spans across multiple domains, including software development, '
                  'technical writing, and academic research.',
                  style: TextStyle(
                    fontSize: 18,
                    height: 1.6, // Improved line height for readability
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
                  ),
                ),
                SizedBox(height: 25), // Adjusted spacing
                ElevatedButton(
                  onPressed: () {
                    // Add functionality for "View More" button
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
                ),
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
