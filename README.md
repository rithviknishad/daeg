# Distributed & Autonomous Energy Grid

*A scalable and distributed framework for energy grids.*

## Abstract

// TODO

### Terminologies

- **EP Address** (Energy Prosumer Address) is the unique address of a prosumer. This address is scoped using `:` to signify the network level. For example prosumer of address `1F28:1992:1990:1001` and `1F28:1992:1990:2939` lies in the same microgrid. Whereas, `1F28:1992:1929:1003` and `1F28:1992:F266:1003` lies in another microgrid that is connected directly through one level above (i.e. parent grid of the microgrid).

### ECP Energy Contract Protocol

// TODO, Research on existing protocols, or create our own protocol.

### Energy Trade Transaction Records (JSON Example)

```json
{
  "<transaction_id>": {
    "producer_ep_addr": "1F28:1992:1999:1000",
    "consumer_ep_addr": "1F28:1992:1999:1002",
    "opening": "<timestamp>",
    "closing": "<timestamp>",
    "units_req": 100,
    "distance": 12,
    "estimated_losses": 1,
    "unit_usage_price": 1,
    "unit_reservation_price": 1,
    "excessive_usage_multiplier": 1.25,
    "units_transferred": 80,
    "transaction_status": "open",
    "total_charges": 200
  }
}
```

<!-- ### MQTT Topic Formats

All prosumers shall have an associated UUID. All state variables of the prosumer shall be updated under the topic: `prosumers/<prosumer_id>` -->