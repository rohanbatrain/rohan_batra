import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/ecell/e_cell_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/orange/orange_education_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/pentasoft/pentasoft_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/sof/sof_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/teri/teri_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/unsw/unsw_card.dart';
import 'package:rohan_batra/education/smcs/extra_curricular/sports/sports_card.dart';

class SMCSPage extends StatelessWidget {
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
                  child: FaIcon(
                    FontAwesomeIcons.image,
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
        title: Text('St. Mary\'s Convent School'),
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
      ),
      body: SingleChildScrollView( // Wrap the entire content in a scrollable view
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'St. Mary\'s Convent School Vikasnagar',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Text(
              'Middle and high school education.\nApr 2010 - Apr 2023',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 16),
            Text(
              'Academic Certificates',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Column(
              children: [
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate1.jpg',
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return FaIcon(
                        FontAwesomeIcons.image,
                        size: 50,
                        color: Colors.grey,
                      );
                    },
                  ),
                  title: Text('Certificate of Merit'),
                  subtitle: Text('English Essay Writing\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Aug 2022',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate1.jpg'),
                ),
                SizedBox(height: 8),
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate2.jpg',
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return FaIcon(
                        FontAwesomeIcons.image,
                        size: 50,
                        color: Colors.grey,
                      );
                    },
                  ),
                  title: Text('Certificate of Merit'),
                  subtitle: Text('Full Attendance Grade VIII\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Mar 2019',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () =>
                      _showImagePopup(context, 'assets/images/certificates/certificate2.jpg'),
                ),
                SizedBox(height: 8),
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate4.jpg',
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return FaIcon(
                        FontAwesomeIcons.image,
                        size: 50,
                        color: Colors.grey,
                      );
                    },
                  ),
                  title: Text('Certificate of Merit'),
                  subtitle: Text('Full Attendance Grade VI\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Mar 2017',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate4.jpg'),
                ),
                SizedBox(height: 8),
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate5.jpg',
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return FaIcon(
                        FontAwesomeIcons.image,
                        size: 50,
                        color: Colors.grey,
                      );
                    },
                  ),
                  title: Text('Certificate of Merit'),
                  subtitle: Text('Full Attendance Grade IV\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Mar 2015',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate5.jpg'),
                ),
                SizedBox(height: 8),
                ListTile(
                  leading: Image.asset(
                    'assets/images/certificates/certificate7.jpg',
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return FaIcon(
                        FontAwesomeIcons.image,
                        size: 50,
                        color: Colors.grey,
                      );
                    },
                  ),
                  title: Text('Certificate of Merit'),
                  subtitle: Text('Full Attendance Grade III\nIssuer: St. Mary\'s Convent School'),
                  trailing: Text(
                    'Mar 2014',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _showImagePopup(
                      context, 'assets/images/certificates/certificate7.jpg'),
                ),
              ],
            ),
            SizedBox(height: 16),

            // Extra Curricular Section
            Divider(
              thickness: 2,
              color: Theme.of(context).dividerColor,
            ),
            SizedBox(height: 16),
            Text(
              'Extra Curricular Activities',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 8),
            Text(
              'A summary of my extracurricular journey, pursued independently during my time in school.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 24),

            // Extra Curricular Cards
            Column(
              children: [
                ECellCard(),
                PentasoftCard(),
                UNSWCard(),
                TERICard(),
                SportsCard(), // Use a separate SportsCard widget
                OrangeEducationCard(),
                SOFCard(),  
              ],
            ),
          ],
        ),
      ),
    );
  }
}
