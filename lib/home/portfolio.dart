import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_animate/flutter_animate.dart'; // Import the animate package
import 'package:rohan_batra/skillwise-portfolio/index.dart';

class Portfolio extends StatelessWidget {
  final bool isDarkMode;

  const Portfolio({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 60, vertical: 30), // Increased padding
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center, // Center items vertically
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Distribute space evenly
        children: [
          // Left Side: Text
          Expanded(
            flex: 6,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Portfolio',
                  style: TextStyle(
                    fontSize: 32, // Increased font size
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2), // Add fade and slide animation
                SizedBox(height: 15), // Adjusted spacing
                Text(
                  'I maintain a main portfolio showcasing my journey, along with a skill-based portfolio that highlights domain-specific work. '
                  'Together, they reflect the diversity of my projects and passions. '
                  'Explore my portfolio to see what I’ve built, what I’m building, and what drives my work.',
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
                        builder: (context) => PortfolioPage(),
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
                  child: Text('View Portfolio'),
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
                    'assets/animations/portfolio.json', // Replace with your Lottie animation
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
