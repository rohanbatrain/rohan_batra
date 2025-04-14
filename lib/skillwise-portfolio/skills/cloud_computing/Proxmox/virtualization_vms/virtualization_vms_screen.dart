import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'pfsense_tile.dart';
import 'garuda_tile.dart';
import 'windows10_tile.dart';

class VirtualizationVMsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Virtualization – VMs (PFSense, Garuda, Windows-10)'),
      ),
      body: ListView(
        children: [
          PfsenseTile(),
          GarudaTile(),
          Windows10Tile(),
        ],
      ),
    );
  }
}
