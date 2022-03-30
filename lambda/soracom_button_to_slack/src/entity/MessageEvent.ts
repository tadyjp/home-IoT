export class EventRaw {
  constructor(
    readonly clickType: number,
    readonly clickTypeName: string,
    readonly batteryLevel: number,
    readonly binaryParserEnabled: boolean
  ) {}

  printMarkdown(): string {
    return JSON.stringify(
      {
        clickType: this.clickType,
        clickTypeName: this.clickTypeName,
        batteryLevel: this.batteryLevel,
        binaryParserEnabled: this.binaryParserEnabled,
      },
      null,
      2
    );
  }
}

export class MessageEvent {
  constructor(readonly imei: string, readonly raw: EventRaw) {}
}
