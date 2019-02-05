/**
 * Display inventories for all agents in GFD
 *
 * @see  https://github.com/ivanminutillo/shroom/blob/b657801/src/pages/inventory/index.js
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-25
 */

import React, { Fragment } from 'react'
import ReactTable from 'react-table'
import styled from 'styled-components'
import { Query } from 'react-apollo'

import Button from '../atoms/button'

import getInventories from '../queries/allInventories'

import { LoadingMini, ErrorMini } from '../components/loading'

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  margin: 8px;
  background: #fff;
`

const Header = styled.h3`
  font-weight: bold;
  font-size: 1.5em;
  margin-top: 1em;
`

const RefreshPane = styled.div`
  float: right;
`

const columns = [
  {
    Header: 'Name',
    columns: [
      {
        Header: 'Id',
        id: 'id',
        accessor: d => `${d.id.substr(0, 6)}..${d.id.substr(-6)}`
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
    Header: 'Tracking identifier',
    accessor: 'trackingIdentifier'
  }
]

const resourceToData = r => ({
  id: r.id,
  name: r.resourceClassifiedAs.name,
  quantity: r.currentQuantity.quantity,
  unit: r.currentQuantity.unit.name,
  trackingIdentifier: r.trackingIdentifier
})

const renderAgent = (agent, i) => (
  <Fragment key={i}>
    <Header>{agent.name}</Header>
    <Body>
      <ReactTable
        data={agent.ownedEconomicResources.map(resourceToData)}
        columns={columns}
        showPagination={false}
        showPageSizeOptions={false}
        defaultPageSize={8}
        minRows={8}
        sortable={false}
        resizable={false}
        className='-striped -highlight'
        style={{ flex: 1, height: '30em' }}
      />
    </Body>
  </Fragment>
)

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
      return (
        <div>
          <RefreshPane><Button onClick={() => refetch()}>refresh</Button></RefreshPane>
          {data.allAgents.map(renderAgent)}
        </div>
      )
    }}
  </Query>
)

export default Inventory
