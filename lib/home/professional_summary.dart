import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class AboutMe extends StatelessWidget {
  final bool isDarkMode;

  const AboutMe({Key? key, required this.isDarkMode}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 700;
    return Column(
      crossAxisAlignment: isMobile ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      children: [
        Text(
          'Professional Summary',
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w900,
            color: isDarkMode ? Colors.white : Colors.black,
          ),
          textAlign: isMobile ? TextAlign.center : TextAlign.start,
        ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
        SizedBox(height: 30),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isMobile ? 16 : 0),
          child: Text(
            'I am a developer and entrepreneur who gets things done, adapting across Linux, cybersecurity, cloud computing, and full-stack development. '
            'With 5+ years of Linux experience, I specialize in automation, optimization, and secure software while contributing to open-source without financial incentive. '
            'A 2-time semi-finalist at IIT Bombay\'s E-Cell, I prioritize ethics over profit, driving community-focused innovation.',
            style: TextStyle(
              fontSize: 20,
              height: 1.6,
              color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
              letterSpacing: 0.5,
            ),
            textAlign: isMobile ? TextAlign.center : TextAlign.start,
          ),
        ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2),
        SizedBox(height: 60),
      ],
    );
  }
}