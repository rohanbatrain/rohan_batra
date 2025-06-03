import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';

class DonatePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Donate'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Support My Work',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                Text(
                  'If you appreciate my work and want to support me, consider making a donation!',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 32),
                // UPI Section
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            FaIcon(FontAwesomeIcons.indianRupeeSign, color: Colors.green, size: 28),
                            SizedBox(width: 10),
                            Text('UPI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.buildingColumns, color: Colors.blueGrey),
                          title: const Text('Kredit.pe UPI'),
                          subtitle: const Text('rohanbatra@kphdfc'),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: 'rohanbatra@kphdfc'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UPI ID copied!')));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Bank Account Section
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            FaIcon(FontAwesomeIcons.university, color: Colors.orange, size: 28),
                            SizedBox(width: 10),
                            Text('Federal Bank Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.idCard, color: Colors.orangeAccent),
                          title: const Text('Account Number'),
                          subtitle: const Text('77770138456849'),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: '77770138456849'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account number copied!')));
                            },
                          ),
                        ),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.code, color: Colors.blueAccent),
                          title: const Text('IFSC Code'),
                          subtitle: const Text('FDRL0007777'),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: 'FDRL0007777'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('IFSC code copied!')));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // BuyMeACoffee / Ko-fi Section
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            FaIcon(FontAwesomeIcons.coffee, color: Colors.brown, size: 28),
                            SizedBox(width: 10),
                            Text('Buy Me a Coffee / Ko-fi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.mugHot, color: Colors.amber),
                          title: const Text('BuyMeACoffee'),
                          subtitle: const Text('@rohanbatrain'),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: '@rohanbatrain'));
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Username copied!')));
                              });
                            },
                          ),
                        ),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.donate, color: Colors.blueAccent),
                          title: const Text('Ko-fi'),
                          subtitle: const Text('@rohanbatrain'),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: '@rohanbatrain'));
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Username copied!')));
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
