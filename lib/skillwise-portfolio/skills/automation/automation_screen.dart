import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'tiles/ansible_tile.dart';
import 'tiles/github_actions_tile.dart';
import 'tiles/n8n_tile.dart';
import 'tiles/make_tile.dart';
import 'tiles/zapier_tile.dart';
import 'tiles/ifttt_tile.dart';
import 'tiles/selenium_tile.dart';
import 'tiles/preseeded_debian_iso_tile.dart';

class AutomationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Automation'),
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
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
              'Automation',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Text(
              'Leverage cutting-edge tools to automate repetitive tasks, streamline workflows, '
              'and boost productivity across various domains.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // const Text(
                    //   'Automation Tools',
                    //   style: TextStyle(
                    //     fontSize: 24,
                    //     fontWeight: FontWeight.bold,
                    //   ),
                    // ),
                    const SizedBox(height: 16),
                    Column(
                      children: [
                        AnsibleTile(),
                        GitHubActionsTile(),
                        N8nTile(),
                        MakeTile(),
                        ZapierTile(),
                        IftttTile(),
                        SeleniumTile(),
                        PreseededDebianISOTile(), // New tile added
                      ],
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