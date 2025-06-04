import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';
import 'package:lottie/lottie.dart';
import 'package:url_launcher/url_launcher.dart';

class DonatePage extends StatelessWidget {
  void _shareDonationDetails(BuildContext context) {
    final details = '''Support My Work\n\nUPI: rohanbatra@kphdfc\nFederal Bank Account: 77770138456849\nIFSC: FDRL0007777\nBuyMeACoffee: https://www.buymeacoffee.com/rohanbatrain\nKo-fi: https://ko-fi.com/rohanbatrain''';
    Clipboard.setData(ClipboardData(text: details));
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Donation details copied!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('Donate'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => _shareDonationDetails(context),
            tooltip: 'Share',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Lottie Animation for Donation
                Lottie.network(
                  'https://lottie.host/430b72e5-d109-45a3-8f67-a2602a4b4aac/GGN8CoO0KB.json', // Example donation animation URL
                  height: 180,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
                const SizedBox(height: 16),
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
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
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
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
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
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // BuyMeACoffee / Ko-fi / PayPal Section
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
                            Text('Buy Me a Coffee / Ko-fi / PayPal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.mugHot, color: Colors.amber),
                          title: const Text('BuyMeACoffee'),
                          subtitle: GestureDetector(
                            onTap: () async {
                              final url = Uri.parse('https://www.buymeacoffee.com/rohanbatrain');
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                            child: const Text('@rohanbatrain', style: TextStyle(color: Colors.blue, decoration: TextDecoration.underline)),
                          ),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: '@rohanbatrain'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
                            },
                          ),
                        ),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.donate, color: Colors.blueAccent),
                          title: const Text('Ko-fi'),
                          subtitle: GestureDetector(
                            onTap: () async {
                              final url = Uri.parse('https://ko-fi.com/rohanbatrain');
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                            child: const Text('@rohanbatrain', style: TextStyle(color: Colors.blue, decoration: TextDecoration.underline)),
                          ),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: '@rohanbatrain'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
                            },
                          ),
                        ),
                        ListTile(
                          leading: FaIcon(FontAwesomeIcons.paypal, color: Colors.indigo),
                          title: const Text('PayPal'),
                          subtitle: GestureDetector(
                            onTap: () async {
                              final url = Uri.parse('https://paypal.me/Rohanbatrain?country.x=IN&locale.x=en_GB');
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                            child: const Text('paypal.me/Rohanbatrain', style: TextStyle(color: Colors.blue, decoration: TextDecoration.underline)),
                          ),
                          trailing: IconButton(
                            icon: FaIcon(FontAwesomeIcons.copy, size: 20, color: Theme.of(context).iconTheme.color),
                            onPressed: () {
                              Clipboard.setData(const ClipboardData(text: 'https://paypal.me/Rohanbatrain?country.x=IN&locale.x=en_GB'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
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
