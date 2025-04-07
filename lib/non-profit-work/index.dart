import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class NonProfitWorkIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Non-Profit Work',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            FontAwesomeIcons.arrowLeft, // Changed to FontAwesome icon
            color: Theme.of(context).iconTheme.color,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        iconTheme: IconThemeData(
          color: Theme.of(context).iconTheme.color,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Non-Profit Work',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 12),
            Text(
              'Here is a summary of my contributions to non-profit initiatives.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 28),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: EdgeInsets.symmetric(vertical: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListTile(
                  leading: Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: FaIcon(
                      FontAwesomeIcons.codeBranch,
                      color: Theme.of(context).iconTheme.color,
                    ),
                  ),
                  title: Text(
                    'Open Source Contributions',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  subtitle: Text(
                    'Contributed to various open-source projects to promote free and open software.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ),
            ),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: EdgeInsets.symmetric(vertical: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListTile(
                  leading: Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: FaIcon(
                      FontAwesomeIcons.chalkboardTeacher,
                      color: Theme.of(context).iconTheme.color,
                    ),
                  ),
                  title: Text(
                    'Community Education',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  subtitle: Text(
                    'Organized workshops and seminars to educate the community on technology and cybersecurity.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
