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

type GraphRecord<T extends {}> = T & { [id: string]: string }

/**
 * Takes a raw response from the DHT (with separate hash / entry)
 * and combines it into a single record object for GraphQL.
 *
 * In this process we lose `type`, but that's OK because GraphQL adds its *own* types.
 */
const normaliseRecord = <T extends {}>(response: DHTResponse<T>): GraphRecord<T> => {
  return {
    id: response.hash,
    ...response.entry
  }
}

/**
 * Given an entry reader function from zomes.js, returns a function which
 * queries DHT records by ID.
 */
export const readSingleEntry = <T extends {}>
  (reader: DHTReadFn<T>) =>
    async (id: string): Promise<DHTResponse<T>> => {
      const records = await reader([id])
      return records[0]
    }

export const resolveSingleEntry = <T extends {}, R extends DHTResponse<any>>
  (reader: DHTReadFn<T>) =>
    (refField: string) =>
      async (inputObj: R): Promise<DHTResponse<T> | null> => {
        if (!inputObj.entry[refField]) {
          return null
        }
        return readSingleEntry(reader)(inputObj.entry[refField])
      }

export const readNamedEntries = <T extends {}, K extends string>
  (reader: DHTReadFn<T>) =>
    async (entryIds: { [k in K]: string }): Promise<{ [k in K]?: DHTResponse<T> } | null> => {
      const recordIds = Object.keys(entryIds)
      if (!recordIds.length) {
        return null
      }

      const records = await reader(Object.values(entryIds))

      return recordIds.reduce((res: { [k in K]?: DHTResponse<T> }, id: string, idx: number) => {
        const rId = id as K
        res[rId] = records[idx]
        return res
      }, {})
    }
