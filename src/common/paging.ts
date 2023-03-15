import { config } from '../config'

export class Paging {
  constructor(offset?: number, limit?: number) {
    this.offset = offset !== undefined && offset > 0 ? offset : 0
    this.limit = limit !== undefined && limit > 0 ? limit : config.paging.maxLimit
  }

  public offset: number
  public limit: number
}