import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class DonatePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Donate'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(FontAwesomeIcons.handHoldingUsd, size: 60, color: Theme.of(context).primaryColor),
              SizedBox(height: 24),
              Text(
                'Support My Work',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              SizedBox(height: 16),
              Text(
                'If you appreciate my work and want to support me, consider making a donation!',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: 32),
              ElevatedButton.icon(
                icon: Icon(FontAwesomeIcons.paypal),
                label: Text('Donate with PayPal'),
                onPressed: () {
                  // TODO: Add your PayPal or donation link here
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
