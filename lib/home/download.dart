import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:rohanbatra/widgets/download_popup.dart'; // Import the animate package

class DownloadSection extends StatelessWidget {
  final bool isDarkMode;

  const DownloadSection({Key? key, required this.isDarkMode}) : super(key: key);

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
                    'assets/animations/download.json',
                    fit: BoxFit.contain,
                  ),
                ),
                SizedBox(height: 32),
                Text(
                  'Download Portfolio',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
                SizedBox(height: 15),
                Text(
                  'Download this webapp to learn more about my skills, experience, and achievements while being completly offline.',
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
                    showDialog(
                      context: context,
                      builder: (context) => DownloadPopup(),
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
                  child: Text('Download'),
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
                  'Download Portfolio',
                  style: TextStyle(
                    fontSize: 32, // Increased font size
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2), // Add fade and slide animation
                SizedBox(height: 15), // Adjusted spacing
                Text(
                  'Download this webapp to learn more about my skills, experience, and achievements while being completly offline.',
                  style: TextStyle(
                    fontSize: 18,
                    height: 1.6, // Improved line height for readability
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
                  ),
                ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2), // Add fade and slide animation
                SizedBox(height: 25), // Adjusted spacing
                ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => DownloadPopup(),
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
                  child: Text('Download'),
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
                    'assets/animations/download.json', // Replace with your Lottie animation
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
