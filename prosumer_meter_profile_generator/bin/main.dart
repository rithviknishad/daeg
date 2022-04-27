import 'dart:convert';
import 'dart:io';

import 'package:args/command_runner.dart';
import 'package:csv/csv.dart';

import 'utils/solcast_query_params.dart';

void main(List<String> arguments) {
  final runner = CommandRunner(
    'profile-manager',
    "Batch energy consumption and generation profile management tool for Smart Meter.",
  );

  runner
    ..addCommand(CacheCommand())
    ..addCommand(MakeCommand());

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
      ..addOption(
        "latitude",
        mandatory: true,
      )
      ..addOption(
        "longitude",
        mandatory: true,
      )
      ..addOption(
        "output-prefix",
        defaultsTo: "",
      )
      ..addMultiOption(
        "capacities",
        help: "Installed capacities of PV systems in KW",
        valueHelp: "in kw",
        defaultsTo: ["1", "2", "3", "5", "10", "20", "40", "50", "75", "100"],
      );
  }

  @override
  Future<void> run() async {
    final argResults = this.argResults;
    if (argResults == null) return;

    final String latitude = argResults["latitude"];
    final String longitude = argResults["longitude"];
    final String outputPrefix = argResults["output-prefix"];
    final List capacities = argResults["capacities"];

    stdout.write("Hitting Solcast API Servers...");
    final pvEstimates = await fetchSolarEstimates(
      SolcastApiQuery(
        latitude: argResults["latitude"],
        longitude: argResults["longitude"],
        solarPvCapacity: "1",
        apiKey: argResults["api-key"],
      ),
    );
    stdout.writeln("  OK");

    int i = 0, totalProfiles = capacities.length;

    for (final _capacity in capacities) {
      ++i;
      final capacity = double.parse(_capacity);
      final csv = ListToCsvConverter().convert([
        ["datetime", "pv_estimate"],
        ...pvEstimates.entries.map((e) => ['${e.key}', e.value * capacity]),
      ]);

      final file = File(
          "pool/generation/$outputPrefix ${DateTime.now()} lat=$latitude long=$longitude cap=$capacity.csv");

      await file.writeAsString(csv, mode: FileMode.write);

      stdout.writeln("[$i/$totalProfiles]  Wrote file: ${file.path}");
    }
  }

  Future<Map<DateTime, double>> fetchSolarEstimates(
      SolcastApiQuery solcastApiQuery) async {
    final Map<DateTime, double> pvEstimates = {};

    final response = await solcastApiQuery.response;
    final data = jsonDecode(response.body);

    for (final record in data['estimated_actuals']) {
      final periodEnd = DateTime.parse(record["period_end"]);
      final pvEstimate = record["pv_estimate"].toDouble();

      pvEstimates[periodEnd] = pvEstimate;
    }

    return pvEstimates;
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
        "penetration-level",
        valueHelp: "double [0:1]",
        defaultsTo: "0.5",
        help: "The penetration level of the prosumers in the environment.",
      )
      ..addOption(
        "parent-prosumer-id",
        valueHelp: "prosumer-id",
        defaultsTo: "2001:0db8:85a3:0000:0000:8a2e:0370",
      )
      ..addOption(
        "consumption-profiles",
        defaultsTo: "pool/consumption",
      )
      ..addOption(
        "generation-profiles",
        defaultsTo: "pool/generation",
      )
      ..addOption(
        "output-prefix",
        abbr: 'o',
        defaultsTo: "profile",
      )
      ..addOption(
        "interval",
        valueHelp: "seconds",
        defaultsTo: "900",
        help: "Time delta of data points in seconds",
      )
      ..addFlag("output-suffix-datetime", defaultsTo: true);
  }

  Future<void> run() async {
    final argResults = this.argResults;
    if (argResults == null) return;

    final double penetrationLevel =
        double.parse(argResults["penetration-level"]);
    final String parentProsumerId = argResults["parent-prosumer-id"];
    final consumptionsDirectory = Directory(argResults["consumption-profiles"]);
    final generationsDirectory = Directory(argResults["generation-profiles"]);
    final String outputPrefix = argResults["output-prefix"];
    final int profileInterval = int.parse(argResults["interval"]);
    final bool shouldSuffixDateTimeInOutput =
        argResults["output-suffix-datetime"];

    final consumptionProfileFiles =
        (await consumptionsDirectory.list().toList())
            .whereType<File>()
            .where((file) => file.path.contains('.csv'));

    final generationProfileFiles = (await generationsDirectory.list().toList())
        .whereType<File>()
        .where((file) => file.path.contains('.csv'));

    stdout.writeln("p: $penetrationLevel");
    stdout.writeln("g profiles: ${generationProfileFiles.length}");
    stdout.writeln("c profiles: ${consumptionProfileFiles.length}");
    stdout.writeln(
      "nc = ${(generationProfileFiles.length / penetrationLevel).ceil()}",
    );
  }
}
