import { FindOptionsWhere } from 'typeorm';

export interface IGetDtoBase<T> {
  toWhere(): FindOptionsWhere<T>
}