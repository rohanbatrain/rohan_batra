import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohanbatra/non-profit-work/open-source/repository_screens/configs_screen.dart';
import 'package:rohanbatra/non-profit-work/open-source/repository_screens/scripts_screen.dart';
import 'package:rohanbatra/non-profit-work/open-source/repository_screens/suckless_dmenu_screen.dart';
import 'package:rohanbatra/non-profit-work/open-source/repository_screens/suckless_dwm_screen.dart';
import 'package:rohanbatra/non-profit-work/open-source/repository_screens/suckless_st_screen.dart';

import 'projects/garuda_linux_on_msi_laptop.dart';
import 'projects/kali_linux.dart';
import 'projects/debian_installation.dart';
import 'projects/arch_linux_installation.dart';
import 'projects/proxmox_installation.dart';
import 'projects/arch_manjaro_dual_boot.dart';
import 'projects/cachy_os_installation.dart';
import 'projects/suckless_tools_usage.dart';

class LinuxAdministrationScreen extends StatefulWidget {
  @override
  _LinuxAdministrationScreenState createState() => _LinuxAdministrationScreenState();
}

class _LinuxAdministrationScreenState extends State<LinuxAdministrationScreen> {
  final List<Map<String, dynamic>> categories = [
    {
      'title': 'MSI Installations',
      'projects': [
        {
          'title': 'Garuda Linux on MSI Laptop',
          'description': 'Installation on your MSI laptop as detailed in your source.',
          'source': 'Garuda Linux Installation Guide',
        },
      ],
    },
    {
      'title': 'Dell Latitude Installations',
      'projects': [
        {
          'title': 'Kali Linux',
          'description': 'Live boot experience used for ethical hacking exploration during your teenage years.',
        },
        {
          'title': 'Debian Installation',
          'description': 'Your first OS installation on the system drive to overcome Windows’ sluggish performance on older hardware.',
        },
        {
          'title': 'Arch Linux Installation',
          'description': 'A deep-dive into Linux internals—learning about directory structure, partitions, and bootloaders, including initial challenges and eventual success.',
        },
        {
          'title': 'Proxmox Installation',
          'description': 'Deployment of a type-1 hypervisor on your Dell Latitude, paired with a secondary Wi-Fi card and pfSense to create a portable virtualized network environment.',
          'note': 'Highlights challenges like I/O latency on older hardware.',
        },
        {
          'title': 'Arch Linux + Manjaro Dual Boot Setup',
          'description': 'Combining a minimal Arch setup with the convenience of Manjaro for everyday use and better integration with tools like KDE Connect.',
          'source': 'Arch with Manjaro Dual Boot Scripts',
        },
        {
          'title': 'Cachy OS Installation',
          'description': 'Installation experience on an HP Pavilion 360 Convertible, demonstrating versatility with different hardware.',
          'source': 'Cachy OS Installation Guide',
        },
      ],
    },
    {
      'title': 'Suckless Products',
      'projects': [
        {
          'title': 'st (suckless terminal)',
          'description': 'A minimalist terminal emulator for X.',
          'source': 'st Repository',
        },
        {
          'title': 'dmenu (dynamic menu)',
          'description': 'A fast and lightweight dynamic menu for X.',
          'source': 'dmenu Repository',
        },
        {
          'title': 'dwm (dynamic window manager)',
          'description': 'A dynamic window manager for X.',
          'source': 'dwm Repository',
        },
      ],
    },
    {
      'title': 'Configurations and Scripts',
      'projects': [
        {
          'title': 'Linux Configuration Repository',
          'description': 'A repository containing your custom configurations for various Linux setups.',
          'source': 'Configs Repository',
        },
        {
          'title': 'Linux Scripts Repository',
          'description': 'A collection of scripts you’ve developed to automate and streamline your Linux administration tasks.',
          'source': 'Scripts Repository',
        },
      ],
    },
  ];

  final Map<String, bool> expandedState = {};

  @override
  void initState() {
    super.initState();
    for (var category in categories) {
      expandedState[category['title']] = false; // Initialize all categories as collapsed
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Linux Administration'),
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft),
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
              'Linux Administration',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Master the art of managing and configuring Linux systems, '
              'from installations to advanced system optimizations.',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.builder(
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final category = categories[index];
                  final isExpanded = expandedState[category['title']] ?? false;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        expandedState[category['title']] = !isExpanded; // Toggle expanded state
                      });
                    },
                    child: Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.primary.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  padding: const EdgeInsets.all(12),
                                  child: FaIcon(
                                    FontAwesomeIcons.linux,
                                    size: 24,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    category['title'],
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Icon(
                                  isExpanded ? Icons.expand_less : Icons.expand_more,
                                  color: theme.colorScheme.primary,
                                ),
                              ],
                            ),
                            if (isExpanded) ...[
                              const SizedBox(height: 16),
                              ...((category['projects'] as List<Map<String, dynamic>>).map((project) {
                                return GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) {
                                          switch (project['title']) {
                                            case 'Garuda Linux on MSI Laptop':
                                              return GarudaLinuxOnMsiLaptop();
                                            case 'Kali Linux':
                                              return KaliLinux();
                                            case 'Debian Installation':
                                              return DebianInstallation();
                                            case 'Arch Linux Installation':
                                              return ArchLinuxInstallation();
                                            case 'Proxmox Installation':
                                              return ProxmoxInstallation();
                                            case 'Arch Linux + Manjaro Dual Boot Setup':
                                              return ArchManjaroDualBoot();
                                            case 'Cachy OS Installation':
                                              return CachyOsInstallation();
                                            case 'Suckless Tools Usage':
                                              return SucklessToolsUsage();
                                            case 'Linux Configuration Repository':
                                              return ConfigsScreen();
                                            case 'Linux Scripts Repository':
                                              return ScriptsScreen();
                                            case 'st (suckless terminal)':
                                              return SucklessStScreen();
                                            case 'dmenu (dynamic menu)':
                                              return SucklessDmenuScreen();
                                            case 'dwm (dynamic window manager)':
                                              return SucklessDwmScreen();
                                            default:
                                              return Scaffold(
                                                body: Center(child: Text('Page not found')),
                                              );
                                          }
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    elevation: 2,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Row(
                                        children: [
                                          Container(
                                            decoration: BoxDecoration(
                                              color: theme.colorScheme.primary.withOpacity(0.1),
                                              shape: BoxShape.circle,
                                            ),
                                            padding: const EdgeInsets.all(8),
                                            child: FaIcon(
                                              FontAwesomeIcons.folderOpen,
                                              size: 20,
                                              color: theme.colorScheme.primary,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              project['title'],
                                              style: theme.textTheme.bodyMedium?.copyWith(
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              }).toList()),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
