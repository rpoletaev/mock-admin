export class AWBStatus {
    code: string
    caption: string
  }

export class AWBResult {
  documentId: number
  awb?: string
  statusCode: string
  dateChange: Date
  constructor(status: string, dt: Date) {
    this.statusCode = status;
    this.dateChange = dt;
  }
}