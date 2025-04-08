import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SportsPage extends StatelessWidget {
  void _showImagePopup(BuildContext context, String imagePath) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
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
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Sports'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: FaIcon(FontAwesomeIcons.arrowLeft, color: Theme.of(context).iconTheme.color),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sports Activities',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 16),
            Text(
              'Participated in these sports activities.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 24),
            Divider(
              thickness: 2,
              color: Theme.of(context).dividerColor,
            ),
            SizedBox(height: 16),
            Text(
              'Sports Certificates',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Column(
              children: [
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate3.jpg',
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
                  title: Text('Certificate of Excellence'),
                  subtitle: Text('Inter-School Football Championship\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Dec 2018',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate3.jpg'),
                ),
                SizedBox(height: 8),
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate6.jpg',
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
                  title: Text('Certificate of Merit'),
                  subtitle: Text('Three Legged Race\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Nov 2014',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate6.jpg'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
