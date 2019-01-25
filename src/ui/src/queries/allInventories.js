/**
 * Query for loading inventories for all agents for display
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-25
 * @flow
 */

import gql from 'graphql-tag'

export default gql`
  query {
    allAgents {
      id
      ownedEconomicResources {
        id
        resourceClassifiedAs {
          name
          category
          processCategory
        }
        trackingIdentifier
        currentQuantity {
          quantity
          unit {
            name
          }
        }
        image
        note
      }
    }
  }
`
