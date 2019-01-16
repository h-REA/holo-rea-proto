import * as React from 'react'
// import styled from 'styled-components'
// import Agent from '../../pages/agent'

// :TODO: might want to keep this in as a top-level page for demoing, once routing is ready to do that
import schema from '@holorea/graphql-adapter/src'
import GraphiQL from 'graphiql'
import { graphQLFetcher } from '../../store'

// const Surface = styled.div`
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   width: 1010px;
//   margin: 0 auto;
// `

const AppTemplate = props => {
  return (
    <GraphiQL
      fetcher={graphQLFetcher}
      schema={schema}
      editorTheme='solarized light' />
  )
  // return (
  //   <Surface>
  //     <Agent />
  //   </Surface>
  // )
}

export default AppTemplate
