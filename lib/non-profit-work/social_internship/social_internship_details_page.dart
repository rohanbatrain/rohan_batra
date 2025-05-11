import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SocialInternshipDetailsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark; // Add dark mode check

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Social Internship Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: FaIcon(FontAwesomeIcons.arrowLeft),
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
              'Social Internship',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black, // Fix text color
                  ),
            ),
            SizedBox(height: 12),
            Text(
              'Here I provide detailed information about my social internship experiences, including the projects I worked on, the organizations I collaborated with, and the impact of my work.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: isDarkMode ? Colors.white : Colors.black87, // Fix text color
                  ),
            ),
            SizedBox(height: 24),
            Text(
              'By Timeline',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black, // Fix text color
                  ),
            ),
            SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                // Show certificate preview dialog
                showDialog(
                  context: context,
                  builder: (context) {
                    return Dialog(
                      child: SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              Text(
                                'Certificate Preview',
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 16),
                              Image.asset(
                                'assets/images/certificates/UBSA/1.jpg', // Certificate image
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return Icon(Icons.error, color: Colors.red);
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              child: Card(
                color: isDarkMode ? Colors.grey[900] : Colors.white, // Fix card color
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo image on the left
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            'assets/images/certificates/UBSA/1.jpg', // Logo image
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(Icons.error, color: Colors.red);
                            },
                          ),
                        ),
                      ),
                      SizedBox(width: 16),
                      // Content on the right
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Summer Intern',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: isDarkMode ? Colors.white : Colors.black, // Fix text color
                                  ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Uttrakhand Blind Sports Association\nJun 2024 - Aug 2024 · 3 mos',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: isDarkMode ? Colors.white70 : Colors.black87, // Fix text color
                                  ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'As a Summer Intern, I contributed to the development of sports initiatives for visually impaired individuals. My role involved organizing events, coordinating with teams, and ensuring the success of the programs.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: isDarkMode ? Colors.white70 : Colors.black87, // Fix text color
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 24),
            Text(
              'By Project',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black, // Fix text color
                  ),
            ),
            SizedBox(height: 12),
            Text(
              'Coming Soon',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
