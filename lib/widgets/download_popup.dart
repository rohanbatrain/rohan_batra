import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class DownloadPopup extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      title: Text(
        'Download Portfolio',
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Select the platform for which you want to download the portfolio:',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16),
          ),
          SizedBox(height: 20),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            alignment: WrapAlignment.center,
            children: [
              _buildPlatformButton(
                context,
                label: 'Windows Executable',
                icon: FontAwesomeIcons.windows,
                color: Colors.blue,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-Windows-x86-64-main.tar.gz');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Windows Executable...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Mac Executable',
                icon: FontAwesomeIcons.apple,
                color: Colors.black,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-macOS-x86-64-main.tar.gz');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Mac Executable...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Linux Executable',
                icon: FontAwesomeIcons.linux,
                color: Colors.orange,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-Linux-x86-64-main.tar.gz');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Linux Executable...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Linux AppImage',
                icon: FontAwesomeIcons.linux,
                color: Colors.deepOrange,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-main.AppImage');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Linux AppImage...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Android (APK)',
                icon: FontAwesomeIcons.android,
                color: Colors.green,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-main.apk');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Android APK...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Android (AAB)',
                icon: FontAwesomeIcons.android,
                color: Colors.lightGreen,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-main.aab');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading Android AAB...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'iPhone (IPA)',
                icon: FontAwesomeIcons.apple,
                color: Colors.grey,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-iOS-x86-64-main.ipa');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading iPhone IPA...')),
                  );
                },
              ),
              _buildPlatformButton(
                context,
                label: 'Web',
                icon: FontAwesomeIcons.chrome,
                color: Colors.teal,
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _launchDownload('https://github.com/rohanbatrain/rohan_batra_releases/releases/download/main/Rohan-Batra-Web-main.tar.gz');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading for Web...')),
                  );
                },
              ),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            'Cancel',
            style: TextStyle(color: Colors.red),
          ),
        ),
      ],
    );
  }

  Widget _buildPlatformButton(BuildContext context,
      {required String label,
      required IconData icon,
      required Color color,
      required VoidCallback onPressed}) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
      ),
      icon: FaIcon(icon, color: Colors.white),
      label: Text(
        label,
        style: TextStyle(color: Colors.white),
      ),
      onPressed: onPressed,
    );
  }

  Future<void> _launchDownload(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
