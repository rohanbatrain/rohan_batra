import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/installation/proxmox_installation_tile.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/virtualization_containers/virtualization_containers_tile.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/virtualization_vms/virtualization_vms_tile.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/host_config/proxmox_host_config_tile.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/vms_deployment/proxmox_vms_deployment_tile.dart';
import 'package:rohanbatra/skillwise-portfolio/skills/cloud_computing/Proxmox/containers_management/proxmox_containers_management_tile.dart';
import '../Docker/docker_tile.dart';

class ProxmoxScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proxmox'),
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft), // Updated to FontAwesome icon
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Add banner images
            Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Proxmox/darkmode-banner.png'
                  : 'assets/images/banners/Proxmox/lightmode-banner.png',
              width: double.infinity,
              fit: BoxFit.cover,
            ),
            const SizedBox(height: 16),
            Divider(
              color: Colors.grey,
              thickness: 1,
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Projects',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Column(
                children: [
                  ProxmoxInstallationTile(),
                  VirtualizationContainersTile(),
                  VirtualizationVMsTile(),
                  ProxmoxHostConfigTile(),
                  ProxmoxVMsDeploymentTile(),
                  ProxmoxContainersManagementTile(),
                  // Removed DockerTile
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
