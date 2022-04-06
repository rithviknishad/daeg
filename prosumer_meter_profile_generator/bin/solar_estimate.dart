class SolarEstimate {
  final DateTime periodEnd;
  final int period;
  final double pvEstimate;

  SolarEstimate({
    required this.periodEnd,
    required this.period,
    required this.pvEstimate,
  });

  factory SolarEstimate.fromJson(Map<String, dynamic> json) {
    return SolarEstimate(
      periodEnd: DateTime.parse(json["period_end"]).toLocal(),
      period: 30 * 60, // TODO: extract from "period" string.
      pvEstimate: json["pv_estimate"].toDouble(),
    );
  }

  @override
  String toString() => "$periodEnd : $pvEstimate KW";
}
