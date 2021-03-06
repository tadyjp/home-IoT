import * as AWS from "aws-sdk";
import { ScheduledEvent } from "aws-lambda";
import { get } from "./utils/https";

const dynamoTable = "nature-remo-sensor";
const natureAPIToken = process.env.NATURE_API_TOKEN!;

class SensorData {
  constructor(
    readonly serialNumber: string,
    readonly eventType:
      | "temperature"
      | "humidity"
      | "illuminance"
      | "motion"
      | "coefficient"
      | "cumulative_electric_energy_effective_digits"
      | "normal_direction_cumulative_electric_energy"
      | "cumulative_electric_energy_unit"
      | "reverse_direction_cumulative_electric_energy"
      | "measured_instantaneous",
    readonly timestamp: Date,
    readonly value: number
  ) {}
}

class NatureAPIService {
  natureAPIToken: string;
  natureDevicesURL = "https://api.nature.global/1/devices";
  natureAppliancesURL = "https://api.nature.global/1/appliances";

  constructor(natureAPIToken: string) {
    this.natureAPIToken = natureAPIToken;
  }

  async fetchSensorsData(): Promise<SensorData[]> {
    const body = await get(this.natureDevicesURL, {
      Authorization: `Bearer ${this.natureAPIToken}`,
    });
    const resData = JSON.parse(body);
    console.log("fetchSensorsData", resData);

    const list: SensorData[] = [];

    for (const item of resData) {
      if (item.newest_events?.te) {
        list.push(
          new SensorData(
            item.serial_number,
            "temperature",
            new Date(item.newest_events.te.created_at),
            item.newest_events.te.val
          )
        );
      }
      if (item.newest_events?.hu) {
        list.push(
          new SensorData(
            item.serial_number,
            "humidity",
            new Date(item.newest_events.hu.created_at),
            item.newest_events.hu.val
          )
        );
      }
      if (item.newest_events?.il) {
        list.push(
          new SensorData(
            item.serial_number,
            "illuminance",
            new Date(item.newest_events.il.created_at),
            item.newest_events.il.val
          )
        );
      }
      if (item.newest_events?.mo) {
        list.push(
          new SensorData(
            item.serial_number,
            "motion",
            new Date(item.newest_events.mo.created_at),
            item.newest_events.mo.val
          )
        );
      }
    }

    return list;
  }

  async fetchSmartMeterData(): Promise<SensorData[]> {
    const body = await get(this.natureAppliancesURL, {
      Authorization: `Bearer ${this.natureAPIToken}`,
    });
    const resData = JSON.parse(body);
    console.log("fetchSmartMeterData", resData);

    const list: SensorData[] = [];

    for (const item of resData) {
      if (!item.smart_meter) {
        continue;
      }

      for (const property of item.smart_meter.echonetlite_properties) {
        list.push(
          new SensorData(
            item.device.serial_number,
            property.name,
            new Date(property.updated_at),
            Number(property.val)
          )
        );
      }
    }

    return list;
  }
}

function dynamoPutItem(
  dynamoDB: AWS.DynamoDB,
  dynamoTable: string,
  sensorData: SensorData
) {
  const params = {
    TableName: dynamoTable,
    Item: {
      SensorType: { S: `${sensorData.serialNumber}#${sensorData.eventType}` },
      Timestamp: { N: (sensorData.timestamp.getTime() / 1000).toString() },
      Value: { N: sensorData.value.toString() },
    },
  };

  return new Promise((resolve, reject) => {
    dynamoDB.putItem(params, function (err, _data) {
      if (err) {
        reject(err);
      } else {
        resolve("ok");
      }
    });
  });
}

async function processEvents(
  dynamoDB: AWS.DynamoDB,
  dynamoTable: string,
  natureAPIService: NatureAPIService
) {
  const sensorDataList = await natureAPIService.fetchSensorsData();
  for (const sensorData of sensorDataList) {
    dynamoPutItem(dynamoDB, dynamoTable, sensorData).catch((err) => {
      console.error(err);
    });
  }

  const smartMeterDataList = await natureAPIService.fetchSmartMeterData();
  console.log("smartMeterDataList", smartMeterDataList);
  for (const sensorData of smartMeterDataList) {
    dynamoPutItem(dynamoDB, dynamoTable, sensorData).catch((err) => {
      console.error(err);
    });
  }
}

export async function handler(_event: ScheduledEvent) {
  const dynamo = new AWS.DynamoDB();
  const natureAPIService = new NatureAPIService(natureAPIToken);

  await processEvents(dynamo, dynamoTable, natureAPIService);
}
