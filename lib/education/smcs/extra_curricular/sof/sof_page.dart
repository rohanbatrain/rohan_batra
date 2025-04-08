import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SOFPage extends StatelessWidget {
  void _showImagePopup(BuildContext context, String imagePath) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8.0),
                  child: Image.asset(
                    imagePath,
                    fit: BoxFit.contain,
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
                ),
              ),
              SizedBox(height: 16),
              Text(
                'Certificate Preview',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
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
        title: Text('Science Olympiad Foundation'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: FaIcon(
            FontAwesomeIcons.arrowLeft,
            color: Theme.of(context).iconTheme.color,
          ),
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
              'Science Olympiad Foundation',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Text(
              'Participated in various Olympiads and achieved distinctions.\n2013 - 2018',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 16),
            Text(
              'Certificates:',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-imo-7.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('International Mathematics Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Dec 2017\nCredential ID: UA0187-07-C-024',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-imo-7.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nso-7.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Science Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Nov 2017\nCredential ID: UA0187-07-C-010',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nso-7.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-imo-6.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('International Mathematics Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Dec 2016\nCredential ID: UA0187-06-A-034',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-imo-6.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nso-6.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Science Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Nov 2016\nCredential ID: UA0187-06-A-002',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nso-6.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-imo-5.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('International Mathematics Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Dec 2015\nCredential ID: UA0187-05-005',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-imo-5.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nso-5.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Science Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Nov 2015\nCredential ID: UA0187-05-C-017',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nso-5.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nco-5.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Cyber Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Jan 2015\nCredential ID: UA0187-05-004',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nco-5.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-imo-4.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('International Mathematics Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Dec 2014\nCredential ID: UA0187-04-017',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-imo-4.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nco-4.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Cyber Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Oct 2014\nCredential ID: UA0187-04-007',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nco-4.jpg'),
                      ),
                    ),
                    Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12.0),
                        leading: Image.asset(
                          'assets/images/certificates/SOF/certificate-nco-3.jpg',
                          fit: BoxFit.cover,
                          width: 50,
                          height: 50,
                          errorBuilder: (context, error, stackTrace) {
                            return FaIcon(FontAwesomeIcons.award, size: 24);
                          },
                        ),
                        title: Text('National Cyber Olympiad'),
                        subtitle: Text(
                          'Issuer: SOF\nIssued: Oct 2013\nCredential ID: UA0187-03-026',
                        ),
                        onTap: () => _showImagePopup(
                            context, 'assets/images/certificates/SOF/certificate-nco-3.jpg'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
