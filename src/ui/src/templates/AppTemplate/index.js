import React, { Fragment } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'styled-components'
import Agent from '../../pages/agent'

// :TODO: might want to keep this in as a top-level page for demoing, once routing is ready to do that
import schema from '@holorea/graphql-adapter/src'
import GraphiQL from 'graphiql'
import { graphQLFetcher } from '../../store'

const Surface = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 1010px;
  margin: 0 auto;
`

const DemoUI = () => (
  <Surface>
    <Agent />
  </Surface>
)

const QueryBrowser = () => (
  <GraphiQL
    fetcher={graphQLFetcher}
    schema={schema}
    editorTheme='solarized light' />
)

const AppTemplate = props => {
  return (
    <Router>
      <Fragment>
        <Route path='/' exact component={DemoUI} />
        <Route path='/graphql' component={QueryBrowser} />
      </Fragment>
    </Router>
  )
}

export default AppTemplate
