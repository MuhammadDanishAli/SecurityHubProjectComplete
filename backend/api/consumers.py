from channels.generic.websocket import AsyncWebsocketConsumer
import json

class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("sensors", self.channel_name)
        await self.accept()
        await self.send(json.dumps({"message": "Connected to sensor updates"}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("sensors", self.channel_name)

    async def sensor_update(self, event):
        sensor_data = event["sensor_data"]
        # Align message format with /sensor-status/ API
        message = {
            "status": "success",
            "data": {
                sensor_data.get("node_id", "unknown"): {
                    "connected": sensor_data.get("status") != "disconnected",
                    "type": sensor_data.get("sensor_type", "unknown"),
                    "value": sensor_data.get("value", 0),
                    "unit": sensor_data.get("unit", ""),
                    "timestamp": sensor_data.get("timestamp", None)
                }
            }
        }
        await self.send(json.dumps(message))