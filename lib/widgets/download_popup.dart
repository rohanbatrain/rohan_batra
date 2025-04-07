import 'package:flutter/material.dart';

class DownloadPopup extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Download Portfolio'),
      content: Text('Select the device type for which you want to download the portfolio:'),
      actions: [
        TextButton(
          onPressed: () {
            // Handle download for desktop
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Downloading for Desktop...')),
            );
          },
          child: Text('Desktop'),
        ),
        TextButton(
          onPressed: () {
            // Handle download for mobile
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Downloading for Mobile...')),
            );
          },
          child: Text('Mobile'),
        ),
      ],
    );
  }
}
