import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProxmoxAutoInstallAssistantDockerScreen extends StatelessWidget {
  const ProxmoxAutoInstallAssistantDockerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Proxmox Auto Install Assistant Docker'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Builder(
              builder: (context) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                final bannerAsset = isDark
                    ? 'assets/images/banners/proxmox-auto-install-assistant-docker/2.png'
                    : 'assets/images/banners/proxmox-auto-install-assistant-docker/1.png';
                return Padding(
                  padding: const EdgeInsets.all(20),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: SizedBox(
                      width: double.infinity,
                      height: 200,
                      child: Image.asset(
                        bannerAsset,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                );
              },
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  Text(
                    '🛠️ Proxmox Auto Installer',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Generate custom unattended Proxmox VE installation ISOs using Docker and profile-based configurations. This tool wraps the official proxmox-auto-install-assistant in a Docker image, allowing you to build automated installer ISOs using separate answer.toml files per profile.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Theme.of(context).hintColor),
                  ),
                  const SizedBox(height: 28),
                  Text('📦 Features', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('✅ Supports multiple profile configurations (e.g. pve-1, pve-2)'),
                        Text('✅ Uses Docker for reproducible, isolated builds'),
                        Text('✅ Output ISOs labeled with profile names'),
                        Text('✅ Clean and scriptable interface'),
                        Text('✅ Works with any Proxmox VE ISO'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('🧱 Directory Structure', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _CodeBlock('''.
├── Dockerfile                  # Docker build file
├── entrypoint.sh              # Smart profile-aware entrypoint
├── iso/
│   ├── proxmox-ve_8.4-1.iso   # Input ISO
│   └── output/                # Output directory
├── secrets/
│   ├── pve-1/
│   │   └── answer.toml
│   └── pve-2/
│       └── answer.toml'''),
                  const SizedBox(height: 28),
                  Text('🚀 Build the Docker Image', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('Run this in the directory where the Dockerfile is located:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('docker build -t proxmox-auto-installer .'),
                  const SizedBox(height: 12),
                  Text('Ensure entrypoint.sh is executable:', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('chmod +x entrypoint.sh'),
                  const SizedBox(height: 28),
                  Text('🛠 Usage', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('Single Profile', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('''docker run --rm \
  -v \$PWD/iso:/iso:ro \
  -v \$PWD/secrets:/answers:ro \
  -v \$PWD/iso/output:/out \
  proxmox-auto-installer:latest \
    /proxmox-ve_8.4-1.iso \
    pve-1'''),
                  const SizedBox(height: 18),
                  Text('Multiple Profiles', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _CodeBlock('''for profile in pve-1 pve-2; do
  docker run --rm \
    -v \$PWD/iso:/iso:ro \
    -v \$PWD/secrets:/answers:ro \
    -v \$PWD/iso/output:/out \
    proxmox-auto-installer:latest \
    /proxmox-ve_8.4-1.iso \
    \$profile
done'''),
                  const SizedBox(height: 28),
                  Text('📁 Output', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('Output ISOs will be generated in iso/output/:', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 6),
                  _CodeBlock('''iso/output/proxmox-ve_8.4-1-auto-pve-1.iso
iso/output/proxmox-ve_8.4-1-auto-pve-2.iso'''),
                  const SizedBox(height: 28),
                  Text('🧪 Troubleshooting', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• Ensure the answer.toml file exists in secrets/<profile>/'),
                        Text('• Make sure Docker has permission to access the mounted volumes'),
                        Text('• Run interactively if you want to debug:'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  _CodeBlock('docker run -it --entrypoint /sh proxmox-auto-installer'),
                  const SizedBox(height: 28),
                  Text('🧹 Cleanup', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _CodeBlock('docker rmi proxmox-auto-installer\nrm iso/output/*'),
                  const SizedBox(height: 28),
                  Text('📖 Resources', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• Proxmox Auto Install Assistant GitHub'),
                        Text('• Proxmox Official Documentation'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('📄 License', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('MIT — Free to use, modify, and distribute.'),
                  const SizedBox(height: 18),
                  Text('✍️ Author', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('Made with ❤️ by Rohan'),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Helper widget for code blocks
class _CodeBlock extends StatelessWidget {
  final String code;
  const _CodeBlock(this.code);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF23272F) : const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? const Color(0xFF444A54) : const Color(0xFFE0E0E0),
        ),
      ),
      child: SelectableText(
        code,
        style: TextStyle(
          fontFamily: 'monospace',
          fontSize: 15,
          color: isDark ? Colors.white : Colors.black,
        ),
      ),
    );
  }
}
