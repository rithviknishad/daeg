import 'package:http/http.dart';
import 'package:meta/meta.dart';

@immutable
class SolcastApiQuery {
  final String latitude;
  final String longitude;
  final String solarPvCapacity;
  final String apiKey;

  const SolcastApiQuery({
    required this.latitude,
    required this.longitude,
    required this.solarPvCapacity,
    required this.apiKey,
  });

  Uri get uri => Uri.parse(
      'https://api.solcast.com.au/world_pv_power/estimated_actuals?latitude=$latitude&longitude=$longitude&capacity=$solarPvCapacity&tilt=12&azimuth=180&hours=168&format=json&api_key=$apiKey');

  Future<Response> get response => get(uri);
}
