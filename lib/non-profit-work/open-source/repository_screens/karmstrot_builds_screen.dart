import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class KarmstrotBuildsScreen extends StatelessWidget {
  const KarmstrotBuildsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Karmstrot Builds'),
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
                    ? 'assets/images/banners/karmstrot-builds/1.png'
                    : 'assets/images/banners/karmstrot-builds/2.png';
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
                    '⚙️ Karmstrot Kernel for OPlus SM8250 Devices',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Karmstrot is a performance-tuned, modular kernel automation suite for OnePlus SM8250 devices. It provides fully automated GitHub Actions workflows to compile, root (via KernelSU), and package the kernel using AnyKernel3. Ideal for developers and power users who want streamlined builds across multiple ROMs with minimal manual effort.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Theme.of(context).hintColor),
                  ),
                  const SizedBox(height: 28),
                  Text('🌟 ROM Support', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• crDroid (Karmstrot_CR-OPlus-SM8250-Kernel.yml)'),
                        Text('• LineageOS (Karmstrot_LO-OPlus-SM8250-Kernel.yml)'),
                        Text('• Nameless OS (Karmstrot_NO-OPlus-SM8250-Kernel.yml)'),
                        Text('• Anomaly-Kernel (Karmstrot_AK-OPlus-SM8250-Kernel.yml)'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('⚙️ Features', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• 🛡️ Built-in KernelSU support (root without Magisk)'),
                        Text('• 💡 YAML-powered GitHub Actions automation'),
                        Text('• ⚡ Tuned for performance and battery'),
                        Text('• 📦 Packaged using AnyKernel3 — flash and go!'),
                        Text('• 🔗 Based on AOSP common kernel'),
                        Text('• 🔁 Extensible & modular CI for new ROMs/devices'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('🚀 Getting Started', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('1. Fork this repository.'),
                        Text('2. Navigate to .github/workflows/ and edit your target YAML file (optional).'),
                        Text('3. Go to the Actions tab and trigger a build.'),
                        Text('4. Once done, download the flashable ZIP from the workflow artifacts.'),
                        Text('✅ All builds run in the cloud via GitHub Actions — no local setup required.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('📱 Target Devices', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• OnePlus 8'),
                        Text('• OnePlus 8 Pro'),
                        Text('• OnePlus 8T'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('📂 Sources Used', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• https://github.com/AzusaHana/KernelSU_Build_Test'),
                        Text('• https://github.com/jef00/kernel_oneplus_sm8250'),
                        Text('• https://github.com/Nameless-AOSP-OSS/kernel_oneplus_sm8250'),
                        Text('• https://github.com/LineageOS/android_kernel_oneplus_sm8250'),
                        Text('• https://github.com/The-Anomalist/Anomaly-Kernel'),
                        Text('• https://github.com/rsuntk/KernelSU'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('🙌 Credits', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('All core credit goes to the original developers and maintainers of the above repositories. I take zero credit for the kernel source or rooting methods themselves — this project simply merges and automates them for easier use.'),
                  const SizedBox(height: 10),
                  Text('Special thanks to:'),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('• 🧠 KernelSU Team'),
                        Text('• 📦 AnyKernel3 by osm0sis'),
                        Text('• 🏗️ GitHub Actions for cloud automation'),
                        Text('• ❤️ ROM teams for crDroid, LineageOS, Nameless OS'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('⚠️ Disclaimer', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('This is a compiled and integrated effort, not a kernel written from scratch. My contribution lies in researching, merging, automating, and testing — assembling the puzzle from open-source pieces, and offering an easy-to-use GitHub Actions pipeline. Full respect and appreciation to the original authors who made this possible. 🙏'),
                  const SizedBox(height: 28),
                  Text('📬 Contact', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text('Have feedback or questions? Open an Issue on GitHub or reach out via Discussions.'),
                  const SizedBox(height: 28),
                  Text('📄 License', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('MIT — Free to use, modify, and distribute.'),
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
