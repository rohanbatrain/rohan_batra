import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:rohan_batra/widgets/download_popup.dart'; // Import the animate package

class DownloadSection extends StatelessWidget {
  final bool isDarkMode;

  const DownloadSection({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 60, vertical: 30), // Increased padding
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center, // Center items vertically
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Distribute space evenly
        children: [
          // Left Side: Lottie Animation
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

          SizedBox(width: 60), // Increased spacing between animation and text

          // Right Side: Text
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
        ],
      ),
    );
  }
}
