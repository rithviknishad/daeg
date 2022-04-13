import 'dart:convert';
import 'dart:io';

import 'package:args/command_runner.dart';

import 'utils/solar_estimate.dart';
import 'utils/solcast_query_params.dart';

void main(List<String> arguments) {
  final runner = CommandRunner(
    'profile-manager',
    "Batch energy consumption and generation profile management tool for Smart Meter.",
  );

  runner.addCommand(CacheCommand());
  runner.addCommand(MakeCommand());

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
        help: "Solcast API Key. Defaults from environment.",
        valueHelp: "SOLCAST_API_KEY",
        defaultsTo: Platform.environment["SOLCAST_API_KEY"],
      )
      ..addOption("latitude", mandatory: true)
      ..addOption("longitude", mandatory: true)
      ..addOption(
        "capacity",
        help: "Installed capacity of PV system in KW",
        valueHelp: "in kw",
        defaultsTo: "1",
      );
  }

  @override
  Future<void> run() async {
    stdout.writeln("Caching solar...");
  }

  Future<void> fetchSolarEstimates(SolcastApiQuery solcastApiQuery) async {
    final response = await solcastApiQuery.response;
    final data = jsonDecode(response.body);
    final records = data['estimated_actuals'];
    for (final record in records) {
      print(SolarEstimate.fromJson(record));
    }
  }

  double lerpDouble(num a, num b, double t) {
    return a + (b - a) * t;
  }
}

class MakeCommand extends Command {
  @override
  final name = "make";

  @override
  final description = "Generates profiles based on the profiles.";

  MakeCommand() {
    argParser
      ..addOption(
        "profiles",
        valueHelp: "int",
        help: "The number of profiles to be generated",
      )
      ..addOption(
        "parent-prosumer-id",
        valueHelp: "prosumer-id",
        defaultsTo: "ff:ff:ff:ff:ff:ff",
      )
      ..addOption(
        "load-profiles",
        defaultsTo: "pool/consumption",
      )
      ..addOption(
        "generation-profiles",
        defaultsTo: "pool/generation",
      )
      ..addOption(
        "output-prefix",
        abbr: 'o',
        defaultsTo: "makes",
      )
      ..addOption(
        "interval",
        valueHelp: "seconds",
        defaultsTo: "900",
        help: "Time delta of data points in seconds",
      )
      ..addFlag("output-suffix-datetime", defaultsTo: true);
  }
}
