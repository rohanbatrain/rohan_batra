import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class UPESPage extends StatelessWidget {
  void _showImagePopup(BuildContext context, String imagePath) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: SingleChildScrollView( // Added SingleChildScrollView to prevent overflow
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset(
                imagePath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Icon(
                      Icons.image_not_supported,
                      size: 100,
                      color: Colors.grey,
                    ),
                  );
                },
              ),
              SizedBox(height: 8),
              Text(
                'Certificate Preview',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('UPES'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SafeArea( // Added SafeArea to prevent overflow
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Padding( // Added Padding to ensure proper spacing
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'UPES',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: 8),
                Text(
                  'Bachelor of Technology - BTech, Computer Science and Engineering\nAug 2023 - Aug 2027',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                SizedBox(height: 16),
                Text(
                  'Academics',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: 8),
                Column(
                  children: [
                    ListTile(
                      leading: Image.asset(
                        'assets/images/certificates/certificate_placeholder.jpg',
                        fit: BoxFit.cover,
                        width: 50,
                        height: 50,
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(
                            Icons.image_not_supported,
                            size: 50,
                            color: Colors.grey,
                          );
                        },
                      ),
                      title: Text('Certificate Placeholder'),
                      subtitle: Text('This certificate will be added once received.\nIssuer: Placeholder'),
                      trailing: Text(
                        'Date Placeholder',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      onTap: () => _showImagePopup(
                          context, 'assets/images/certificates/certificate_placeholder.jpg'),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Divider(
                  thickness: 2,
                  color: Theme.of(context).dividerColor,
                ),
                SizedBox(height: 16),
                Text(
                  'Extracurricular Activities',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: 8),
                Text(
                  'Participated in various hackathons and coding competitions.',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                SizedBox(height: 16),
                Text(
                  'Extracurricular',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: 8),
                Column(
                  children: [
                    ListTile(
                      leading: Image.asset(
                        'assets/images/certificates/UPES/certificate1.jpg',
                        fit: BoxFit.cover,
                        width: 50,
                        height: 50,
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(
                            Icons.image_not_supported,
                            size: 50,
                            color: Colors.grey,
                          );
                        },
                      ),
                      title: Text('Incubation Letter'),
                      subtitle: Text('Startup Incubator\nIssuer: Runway'),
                      trailing: Text(
                        'Nov 2023',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      onTap: () => _showImagePopup(
                          context, 'assets/images/certificates/UPES/certificate1.jpg'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
