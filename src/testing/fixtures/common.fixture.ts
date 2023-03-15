import { UpdateResult } from 'typeorm'
import { IGetDtoBase } from '../../common/getDtoBase'
import { Paging } from '../../common/paging'

export class CommonFixture {
  public paging: { [key: string]: Paging } = {
    defaultPaging: new Paging()
  }

  public updateResults: { [key: string]: UpdateResult } = {
    oneDeleted: {
      raw: '',
      affected: 1,
      generatedMaps: []
    },
    zeroDeleted: {
      raw: '', 
      affected: 0, 
      generatedMaps: []
    }
  }
}