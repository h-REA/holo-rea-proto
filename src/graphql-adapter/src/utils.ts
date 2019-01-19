/**
 * Helper functions for handling data from the Holochain DHT in GraphQL queries
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import { DHTResponse, Hash } from '@holorea/zome-api-wrapper'

// what the zome APIs provide
type DHTReadFn<T> = (which: Hash<T>[]) => Promise<DHTResponse<T>[]>

// abstractions that these helpers provide
export const readSingleEntry = <T extends {}>
  (reader: DHTReadFn<T>) =>
    async (id: string): Promise<DHTResponse<T>> => {
      const records = await reader([id])
      return records[0]
    }

export const resolveSingleEntry = <T extends {}, R extends DHTResponse<any>>
  (reader: DHTReadFn<T>) =>
    (refField: string) =>
      async (inputObj: R): Promise<DHTResponse<T>> => {
        return readSingleEntry(reader)(inputObj.entry[refField])
      }
