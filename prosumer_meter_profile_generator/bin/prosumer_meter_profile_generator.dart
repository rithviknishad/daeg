import 'dart:convert';
import 'dart:io';

import 'package:args/args.dart';
import 'package:args/command_runner.dart';
import 'package:http/http.dart' as http;

import 'solar_estimate.dart';

void main(List<String> arguments) {
  final runner = CommandRunner(
    'profile-manager',
    "Batch energy consumption and generation profile management tool for Smart Meter.",
  );

  final parser = ArgParser()
    ..addOption(
      'output',
      help: "The path of the output CSV file",
      defaultsTo: "output.csv",
      valueHelp: "<prosumer_id>.csv",
    )
    ..addOption(
      'interval',
      help: "Time delta of data points in seconds",
      defaultsTo: "900",
      valueHelp: "900",
    )
    ..addOption(
      'source-load-profile',
      help: "The path to load profile",
      defaultsTo: "load_profile.csv",
      valueHelp: "path/to/load_profile.csv",
    )
    ..addOption('latitude', defaultsTo: "11.3")
    ..addOption('longitude', defaultsTo: "74.6")
    ..addOption('solar-capacity', defaultsTo: "5");

  final solcastApiKey = Platform.environment["SOLCAST_API_KEY"];
  if (solcastApiKey == null) {
    stderr.writeln("Missing SOLCAST_API_KEY in environment. Shall terminate.");
    exit(1);
  }

  runner.run(arguments).catchError((error) {
    if (error is! UsageException) throw error;
    print(error);
    exit(64); // Exit code 64 indicates a usage error.
  });
}

class CacheCommand extends Command {
  @override
  final name = "cache-solar";

  @override
  final description = "Cache solar profiles using Solcast API and save as CSV.";

  CacheCommand() {
    argParser
      ..addOption(
        "api-key",
        help: "Solcast API Key",
        valueHelp: Platform.environment["SOLCAST_API_KEY"],
        defaultsTo: Platform.environment["SOLCAST_API_KEY"],
      )
      ..addOption("latitude", mandatory: true)
      ..addOption("longitude", mandatory: true)
      ..addOption(
        "capacity",
        help: "Installed capacity of PV system in KW",
        valueHelp: "5  # signifies 5 KW PV System",
        defaultsTo: "1",
      );
  }
}

class MakeCommand extends Command {
  @override
  final name = "make";

  @override
  final description = "Generates profiles based on the profiles.";

  MakeCommand() {
    argParser
      ..addOption("profiles", help: "The number of profiles to be generated")
      ..addOption("parent-prosumer-id", defaultsTo: "ff:ff:ff:ff:ff:ff")
      ..addOption("load-profiles", defaultsTo: "pool/consumption")
      ..addOption("generation-profiles", defaultsTo: "pool/generation")
      ..addOption("output-prefix", abbr: 'o', defaultsTo: "makes")
      ..addFlag("output-suffix-datetime", defaultsTo: true);
  }
}

Future<void> fetchSolarEstimates(
  double latitude,
  double longitude,
  double capacity,
  String solcastApiKey,
) async {
  final res = await http.get(Uri.parse(
      'https://api.solcast.com.au/world_pv_power/estimated_actuals?latitude=$latitude&longitude=$longitude&capacity=$capacity&tilt=12&azimuth=180&hours=168&format=json&api_key=$solcastApiKey'));

  final data = jsonDecode(res.body);

  final records = data['estimated_actuals'];

  for (final record in records) {
    print(SolarEstimate.fromJson(record));
  }
}

double lerpDouble(num a, num b, double t) {
  return a + (b - a) * t;
}
