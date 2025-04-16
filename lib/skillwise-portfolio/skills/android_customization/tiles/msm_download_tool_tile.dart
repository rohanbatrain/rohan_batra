import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/msm_download_tool_screen.dart';

class MsmDownloadToolTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => MsmDownloadToolScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.download),
        title: const Text(
          'MSM Download Tool',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Flash firmware on Qualcomm devices.'),
      ),
    );
  }
}
