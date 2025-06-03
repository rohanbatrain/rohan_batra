import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class OdinScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text('Odin'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner widget
                  SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: Image.asset(
                      isDarkMode
                          ? 'assets/images/banners/Samsung-Odin/2.png'
                          : 'assets/images/banners/Samsung-Odin/1.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Details Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Details about Odin',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Samsung Odin is a proprietary tool used to flash firmware, recover bricked devices, and perform other low-level operations on Samsung devices. '
                          'It is widely used by enthusiasts and developers to install custom ROMs, kernels, and recoveries, as well as to restore devices to their factory state.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'My journey with Samsung Odin began when I was just a kid in 4th standard. My parents had their first smartphone, a Samsung device running Android KitKat 4.0. '
                          'One day, I accidentally pressed the volume button during boot, and the phone entered the Odin mode screen. It was a scary moment—I thought the phone was damaged. '
                          'Coming from a low-income family, the thought of losing the only smartphone was chaotic. This experience sparked my curiosity about Odin and Android customization.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Later, in 2016, I bricked a friend’s phone while trying to flash a J2 ROM on a different J2 model. This incident motivated me to learn more about Odin and how to use it properly. '
                          'Over time, I gained experience in using Odin for tasks such as:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Flashing stock firmware to recover bricked devices.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Installing custom ROMs and kernels to enhance device performance and features.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Flashing custom recoveries like TWRP for advanced customization.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Downgrading or upgrading firmware versions for compatibility or performance improvements.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Unlocking additional features by modifying system partitions.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Samsung Odin has been an essential tool in my Android journey, helping me recover from mistakes and explore the full potential of Samsung devices. '
                          'It taught me the importance of caution and preparation when experimenting with Android customization.',
                          style: TextStyle(fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
