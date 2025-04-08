import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'upes_page.dart';
import 'smcs/smcs_page.dart';

class FormalEducationIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('Education'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            FontAwesomeIcons.arrowLeft,
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
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Formal Education',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Text(
              'Here is a summary of my formal education journey.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 24),

            // UPES Card
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: EdgeInsets.symmetric(vertical: 12),
              child: ListTile(
                contentPadding: EdgeInsets.all(16),
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    isDark
                        ? 'assets/logos/UPES/UPES1.png'
                        : 'assets/logos/UPES/UPES2.png',
                    height: 50,
                    width: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(Icons.school, size: 50);
                    },
                  ),
                ),
                title: Text(
                  'UPES',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                subtitle: Text(
                  'Bachelor of Technology - BTech, Computer Science and Engineering\nAug 2023 - Aug 2027',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => UPESPage(),
                    ),
                  );
                },
              ),
            ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2),

            // Timeline line
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Container(
                height: 32,
                width: 2,
                color: Theme.of(context).dividerColor,
                margin: EdgeInsets.only(left: 32),
              ),
            ),

            // School Card
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: EdgeInsets.symmetric(vertical: 12),
              child: ListTile(
                contentPadding: EdgeInsets.all(16),
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    'assets/logos/SMCS/building.jpg',
                    height: 50,
                    width: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(Icons.school, size: 50);
                    },
                  ),
                ),
                title: Text(
                  'St. Mary\'s Convent School Vikasnagar',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                subtitle: Text(
                  'Middle and high school education.\nApr 2010 - Apr 2023',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SMCSPage(),
                    ),
                  );
                },
              ),
            ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2),
          ],
        ),
      ),
    );
  }
}
