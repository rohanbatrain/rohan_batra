import 'package:flutter/material.dart';

class SucklessToolsUsage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Suckless Tools Usage'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Utilization and customization of suckless software products including:\n- st (suckless terminal)\n- dmenu (dynamic menu)\n- dwm (dynamic window manager)\n\nSources:\n- st Repository\n- dmenu Repository\n- dwm Repository',
        ),
      ),
    );
  }
}
