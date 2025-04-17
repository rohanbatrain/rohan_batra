import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'tiles/adb_tile.dart';
import 'tiles/fastboot_tile.dart';
import 'tiles/magisk_tile.dart';
import 'tiles/msm_download_tool_tile.dart';
import 'tiles/odin_tile.dart';
import 'tiles/orangefox_tile.dart';
import 'tiles/sp_flash_tool_tile.dart';
import 'tiles/supersu_tile.dart';
import 'tiles/twrp_tile.dart';
import 'tiles/mtkclient_tile.dart';

class AndroidCustomizationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Android Customization'),
        leading: IconButton(
          icon: const Icon(FontAwesomeIcons.arrowLeft),
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
            const SizedBox(height: 16),
            Text(
              'Android Customization',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Text(
              'Explore tools and techniques to personalize and optimize Android devices, '
              'enhancing functionality and user experience.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(8.0),
                children: [
                  AdbTile(),
                  FastbootTile(),
                  MagiskTile(),
                  MsmDownloadToolTile(),
                  OdinTile(),
                  OrangeFoxTile(),
                  SpFlashToolTile(),
                  SuperSuTile(),
                  TwrpTile(),
                  MtkClientTile(), // Added MTKClient tile
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
