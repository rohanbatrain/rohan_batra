import 'package:flutter/material.dart';

class AboutMe extends StatelessWidget {
  final bool isDarkMode;

  const AboutMe({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'About Me',
          style: TextStyle(
            fontSize: 32, // Increased font size for better emphasis
            fontWeight: FontWeight.w900, // Bolder font weight
            color: isDarkMode ? Colors.white : Colors.black,
          ),
        ),
        SizedBox(height: 20), // Increased spacing for better layout
        Text(
          'I am a developer and entrepreneur who gets things done, adapting across Linux, cybersecurity, cloud computing, and full-stack development. '
          'With 5+ years of Linux experience, I specialize in automation, optimization, and secure software while contributing to open-source without financial incentive. '
          'A 2-time semi-finalist at IIT Bombay’s E-Cell, I prioritize ethics over profit, driving community-focused innovation.',
          style: TextStyle(
            fontSize: 18, // Slightly larger font size for readability
            height: 1.5, // Added line height for better text spacing
            color: isDarkMode ? Colors.grey[300] : Colors.grey[800], // Adjusted color for better contrast
          ),
        ),
        SizedBox(height: 50), // Increased spacing for better separation
      ],
    );
  }
}
