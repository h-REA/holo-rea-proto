/**
 * Display inventories for all agents in GFD
 *
 * @see  https://github.com/ivanminutillo/shroom/blob/b657801/src/pages/inventory/index.js
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-25
 */

import React from 'react'
import ReactTable from 'react-table'
import styled from 'styled-components'
import { Query } from 'react-apollo'

import getInventories from '../queries/allInventories'

import { LoadingMini, ErrorMini } from '../components/loading'

const columns = [
  {
    Header: 'Name',
    columns: [
      {
        Header: 'Id',
        accessor: 'id'
      },
      {
        Header: 'Name',
        id: 'name',
        accessor: d => d.name
      }
    ]
  },
  {
    Header: 'Current Quantity',
    columns: [
      {
        Header: 'Quantity',
        accessor: 'quantity'
      },
      {
        Header: 'Unit',
        accessor: 'unit'
      }
    ]
  },
  {
    Header: 'Category',
    columns: [
      {
        Header: 'Taxonomy',
        accessor: 'taxonomy'
      },
      {
        Header: 'Process Category',
        accessor: 'processCategory'
      }
    ]
  }
]

const Inventory = props => (
  <Query
    query={getInventories}
    variables={{}}
  >
    {({ loading, error, data, refetch, client }) => {
      if (loading) return <LoadingMini />
      if (error) {
        return (
          <ErrorMini refetch={refetch} message={`Error! ${error.message}`} />
        )
      }
      console.log(data)
      const datat = data.allAgents[0].ownedEconomicResources.map(r => ({
        id: r.id,
        name: r.resourceClassifiedAs.name,
        quantity: r.currentQuantity.quantity,
        unit: r.currentQuantity.unit.name,
        taxonomy: r.resourceClassifiedAs.category,
        processCategory: r.resourceClassifiedAs.processCategory
      }))
      return (
        <Body>
          <ReactTable
            data={datat}
            filterable
            defaultFilterMethod={(filter, row) =>
              String(row[filter.id]) === filter.value}
            columns={columns}
            defaultPageSize={10}
            className='-striped -highlight'
            style={{ flex: 1 }}
          />
        </Body>
      )
    }}
  </Query>
)

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  margin: 8px;
  background: #fff;
`

export default Inventory
