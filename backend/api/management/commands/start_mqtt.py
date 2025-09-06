from django.core.management.base import BaseCommand
from api.mqtt_handler import start_mqtt

class Command(BaseCommand):
    help = 'Start MQTT Client'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting MQTT Client...'))
        start_mqtt()
        while True:
            pass  # Keep process alive
