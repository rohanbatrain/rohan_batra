import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class MsmDownloadToolScreen extends StatelessWidget {
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
        title: const Text('MSM Download Tool'),
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
                          ? 'assets/images/banners/MSM/2.png'
                          : 'assets/images/banners/MSM/1.png',
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
                          'Details about MSM Download Tool',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'The MSM Download Tool is a proprietary tool used to unbrick and restore Qualcomm-based devices to their factory state. '
                          'It works by flashing the stock firmware onto the device in EDL (Emergency Download) mode, '
                          'making it a lifesaver for users who have hard-bricked their phones.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I discovered the MSM Download Tool during a nerve-wracking experience when I hard-bricked my OnePlus 8T. '
                          'It was a scary moment, but using the MSM Download Tool in EDL mode, I was able to bring my phone back to life. '
                          'This experience taught me the importance of having reliable tools for recovering devices.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'In my opinion, OnePlus devices are some of the best for rooting and customization. '
                          'Their openness to bootloader unlocking and the availability of recovery tools make them ideal for enthusiasts. '
                          'However, the green line issues that have plagued some devices are unfortunate and detract from an otherwise great experience.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'The MSM Download Tool has been an invaluable resource for restoring bricked devices, '
                          'and it remains a must-have for anyone experimenting with custom ROMs, kernels, or other modifications on OnePlus devices.',
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
