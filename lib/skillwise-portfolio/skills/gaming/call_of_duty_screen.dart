import 'package:flutter/material.dart';

class CallOfDutyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDarkMode ? Colors.black : Colors.grey[900];
    final consoleGreen = const Color(0xFF00FF41);
    final dossierStyle = TextStyle(
      fontFamily: 'monospace',
      color: consoleGreen,
      fontSize: 16,
      letterSpacing: 1.2,
    );
    final redacted = TextStyle(
      color: Colors.red[900],
      backgroundColor: Colors.black,
      fontWeight: FontWeight.bold,
      fontSize: 16,
    );
    final quotes = [
      'This is for the record…',
      'We get dirty, and the world stays clean.',
      'Check those corners.',
      'Bravo six, going dark.',
      'Stay frosty.',
    ];
    int _quoteIndex = 0;
    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(title: const Text('Call of Duty Series')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Call-of-duty/2.png'
                    : 'assets/images/banners/Call-of-duty/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 16),
            // Dossier-style folder
            Container(
              width: double.infinity,
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.85),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: consoleGreen, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('🔥 TF141 — My Brothers in Arms', style: dossierStyle.copyWith(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('"In the shadow of chaos, they don’t just survive — they strike back."', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text('📍 Codename: TF141', style: dossierStyle),
                  Text('📍 Status: Active', style: dossierStyle),
                  Text('📍 Allegiance: None — Ghosts don’t need flags.', style: dossierStyle),
                  Text('📍 Deployment Zones: Verdansk, Urzikstan, Kastovia, Las Almas, London, and beyond.', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text('🪖 Personal Dossier', style: dossierStyle.copyWith(decoration: TextDecoration.underline)),
                  const SizedBox(height: 4),
                  Text('Operative Name: [Your Gamer Tag]', style: dossierStyle),
                  Text('Rank: Veteran', style: dossierStyle),
                  Text('Call of Duty: Bound by loyalty, adrenaline, and every mission that brought TF141 back together.', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text('💣 Mission Debrief: Why TF141 Matters', style: dossierStyle.copyWith(decoration: TextDecoration.underline)),
                  const SizedBox(height: 4),
                  Text('Price – The commander with steel nerves and a heart that never flinches.', style: dossierStyle),
                  Text('Soap – Loyal, loud, and lethal — the brother you want watching your six.', style: dossierStyle),
                  Text('Ghost – A mask, a myth, a man whose silence speaks louder than war drums.', style: dossierStyle),
                  Text('Gaz – Tactical, sharp, and calm under fire — the glue that holds it together.', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text("🫡 TF141 isn't just a squad — it's a creed.", style: dossierStyle),
                  Text('A belief that when the world breaks down, you don’t run — you suit up.', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text('🎖️ Why I Bleed for MW', style: dossierStyle.copyWith(decoration: TextDecoration.underline)),
                  const SizedBox(height: 4),
                  Text('The Modern Warfare series isn’t a game — it’s a battlefield memoir.', style: dossierStyle),
                  Text('I’ve fought alongside TF141 through deserts, bunkers, and betrayal.', style: dossierStyle),
                  Text('I’ve rewatched cutscenes like sacred tapes, memorized every line.', style: dossierStyle),
                  Text('These are more than characters — they’re fragments of who I am as a gamer.', style: dossierStyle),
                  const SizedBox(height: 12),
                  Text('🎮 Loadout of Love', style: dossierStyle.copyWith(decoration: TextDecoration.underline)),
                  const SizedBox(height: 4),
                  Text('Primary Weapon: Loyalty to the franchise', style: dossierStyle),
                  Text('Secondary: Tactical nostalgia', style: dossierStyle),
                  Text('Lethal: Teammate moments that hit like airstrikes', style: dossierStyle),
                  Text('Perk: Deep emotional attachment', style: dossierStyle),
                  const SizedBox(height: 12),
                  // Redacted line effect
                  Row(children: [
                    Text('████████████████████████████████████████████████████████████████████████████████████████████', style: redacted),
                  ]),
                  const SizedBox(height: 8),
                  // Quote slider (simple, not interactive)
                  Row(
                    children: [
                      Icon(Icons.format_quote, color: consoleGreen, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          quotes[0],
                          style: dossierStyle.copyWith(fontStyle: FontStyle.italic),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Center(child: Text('Call of Duty Series – First-person shooter franchise.')),
          ],
        ),
      ),
    );
  }
}
