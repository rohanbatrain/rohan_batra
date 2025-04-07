import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class NonProfit extends StatelessWidget {
  final bool isDarkMode;

  const NonProfit({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 40, vertical: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Left Side: Lottie Animation
          Expanded(
            flex: 4,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final maxHeight = constraints.maxHeight * 0.8; // Slightly zoom in
                return ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: maxHeight,
                    maxWidth: maxHeight, // Maintain aspect ratio
                  ),
                  child: Lottie.asset(
                    'assets/animations/non-profit.json', // Replace with your Lottie animation
                    fit: BoxFit.contain,
                  ),
                );
              },
            ),
          ),

          SizedBox(width: 50), // Add spacing between animation and text

          // Right Side: Text
          Expanded(
            flex: 6,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Non-Profit Initiatives',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'I actively contribute to non-profit organizations, focusing on community development, '
                  'education, and technology for good.',
                  style: TextStyle(
                    fontSize: 18,
                    color: isDarkMode ? Colors.grey[400] : Colors.grey[700],
                  ),
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    // Add functionality for "Learn More" button
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDarkMode ? Colors.white : Colors.black,
                    foregroundColor: isDarkMode ? Colors.black : Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text('Learn More'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
