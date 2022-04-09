#!/usr/bin/env python

from abc import ABC
from dataclasses import dataclass
from datetime import datetime
import json
import sys
from typing import Final


@dataclass
class Transaction(ABC):
    """
    Abstract class Transaction provides a common base for Atomic and Aggregated
    Transaction.
    """

    id: str
    """
    The unique key used to identify an atomic transaction in MGEMS database.
    """

    opened_at: datetime
    """
    The date and time at which energy exchange has started.
    """

    closed_at: datetime
    """
    The date and time at which energy exchange has stopped.
    """

    def parse(json_data: dict) -> "Transaction":
        # TODO: @rajasri parse the transaction and return an instance of `AtomicTransaction` or `AggregateTransaction` appropriatley.
        raise NotImplementedError()

    def export(self, filename: str = "transaction.pdf") -> None:
        # TODO: @rajasri export this transaction (`self`) to a pdf file whose file name is specified by `filename`.
        raise NotImplementedError()


@dataclass
class AtomicTransaction(Transaction):
    producer_address: str
    """
    The Vaidyuti Protocol Address of the producer who has attempted to provide
    energy to a consumer.
    """

    consumer_address: str
    """
    The Vaidyuti Protocol Address of the consumer who has received energy from a
    producer.
    """

    energy_consumed: float
    """
    The amount of energy consumed by the consumer in kWh. Transmission and
    distribution lossess are not accounted in this attribute.
    """

    transmission_lossess: float
    """
    The estimated amount of energy lost in transmission and distribution in kWh.
    """

    consumption_unit_price: float
    """
    The per unit price thats levied on the amount of energy directly consumed by
    the consumer.
    """

    lossess_unit_price: float
    """
    The per unit price thats levied on the estimated amount of energy lost in 
    transmission and distribution layers.
    """


class AggregateTransaction(Transaction):
    # TODO WARN: @rithvik this model is not yet completed.
    pass


def handle_no_transaction_json_file_specified() -> None:
    print("Specify transaction to be exported (eg: ./main.py transaction.json)")
    exit(1)


def main():
    with open(" ".join(sys.argv[1:]) or handle_no_transaction_json_file_specified()) as json_file:
        Transaction.parse(json.load(json_file)).export()


if __name__ == "__main__":
    main()
